import {
  Bookmark,
  PORT,
  isFromTuiApp,
  createBookmark,
  BookmarkChange,
  ReverseLookupdMap,
  BookmarkChangeRepository,
  isBoookmarkChange,
  BookmarkChangeKind,
} from '@bookmarks-tui/common';
import { Storage } from './storage';

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode & {
  trash?: boolean;
};

let hashes = new ReverseLookupdMap<string, string>();
const storage = new Storage();
let changes: BookmarkChangeRepository = new BookmarkChangeRepository(storage);

enum HostStatus {
  Unknown,
  Alive,
  Inactive,
}

let lastHostStatus: HostStatus = HostStatus.Unknown;

let isInitialized = false;

// TODO: figure out a better way to prevent syncing
// This set holds the ids we do not want to sync. It's used when receiving sync iformation and apply the changse
// but we don't want these changes to be synced back to the host
const ignoreSyncIds = new Set<string>();

const HOST = `http://localhost:${PORT}`;

const createBookmarkFromTreeNode = (node: BookmarkTreeNode): Bookmark => {
  const { title, url } = node;
  if (!title || !url) {
    throw new Error('Invalid bookmark');
  }
  return createBookmark({
    id: node.id,
    title,
    url,
  });
};

// gets all the bookmarks and flattens the tree
async function getAllBookmarks(): Promise<Bookmark[]> {
  const tree: BookmarkTreeNode[] = await chrome.bookmarks.getTree();
  const stack: BookmarkTreeNode[] = [];
  const bookmarks: Bookmark[] = [];
  for (const node of tree) {
    // filter out deleted bookmarks
    if (node.children && !node.trash) {
      stack.push(...node.children);
      // TODO: check if this  "else if" is needed here
    } else if (node.url !== undefined && node.url.length > 0) {
      bookmarks.push(
        createBookmark({ title: node.title, url: node.url, id: node.id }),
      );
    }
  }

  while (stack.length > 0) {
    let node = stack.pop();
    if (!node) {
      continue;
    }
    if (node.children) {
      stack.push(...node.children);
    } else if (node.url !== undefined && node.url.length > 0) {
      bookmarks.push(
        createBookmark({ title: node.title, url: node.url, id: node.id }),
      );
    }
  }
  return bookmarks;
}

const isHostAlive = async (): Promise<boolean> => {
  try {
    const response = await fetch(new URL('status', HOST).toString());
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const init = async (): Promise<void> => {
  if (!isInitialized) {
    const chromeBookmarks = await getAllBookmarks();
    hashes = new ReverseLookupdMap<string, string>(
      Object.entries(await storage.getAllBookmarkHashes()),
    );
    await changes.init();
    console.log('hashes', hashes);
    // these are the bookmarks that are not in the storage
    const bookmarksToAdd = chromeBookmarks.filter((b) => {
      return hashes.get(b.id) !== b.hash;
    });
    // add the bookmark changes for syncing
    await Promise.all(
      bookmarksToAdd.map(async (b) => {
        await storage.setBookmarkHashes({ [b.id]: b.hash });
        await changes.add(b);
      }),
    );
  }
};

export const onBookmarkCreated = async (
  _: string,
  bookmarkTreeNode: BookmarkTreeNode,
) => {
  const newBookmark = createBookmarkFromTreeNode(bookmarkTreeNode);
  hashes.set(newBookmark.id, newBookmark.hash);
  if (!ignoreSyncIds.has(newBookmark.id)) {
    changes.add(newBookmark);
  } else {
    ignoreSyncIds.delete(newBookmark.id);
  }
};

export const onBookmarkRemoved = async (bookmarkId: string) => {
  if (!ignoreSyncIds.has(bookmarkId)) {
    changes.add(bookmarkId);
  } else {
    ignoreSyncIds.delete(bookmarkId);
  }
  hashes.delete(bookmarkId);
};

export const onBookmarkChanged = async (
  bookmarkId: string,
  bookmarkChangedData: Omit<BookmarkTreeNode, 'id'>,
) => {
  const bookmark = createBookmarkFromTreeNode({
    ...bookmarkChangedData,
    id: bookmarkId,
  });
  hashes.delete(bookmarkId);
  hashes.set(bookmarkId, bookmark.hash);
  if (!ignoreSyncIds.has(bookmarkId)) {
    changes.add(bookmark);
  } else {
    ignoreSyncIds.delete(bookmarkId);
  }
};

export const onBookmarkMoved = async (
  id: string,
  {
    parentId,
    oldParentId,
  }: { parentId: string; oldParentId: string; index: number; oldIndex: number },
) => {
  if (parentId === oldParentId) {
    return;
  }
  const newParent = await chrome.bookmarks.get(parentId);
  if (!newParent || !newParent[0]) {
    return;
  }
  if ((newParent[0] as BookmarkTreeNode).trash) {
    await onBookmarkRemoved(id);
  }
};

export const updateIcon = async (isAlive: boolean): Promise<void> => {
  if (!isAlive) {
    chrome.action.setIcon(
      { path: '/icon/bookmarks-tui-connector-inactive-48px.png' },
      () => {},
    );
    return;
  }
  chrome.action.setIcon(
    { path: '/icon/bookmarks-tui-connector-48px.png' },
    () => {},
  );
};

const sync = async (): Promise<void> => {
  console.log('sync', changes.getAllchanges());
  try {
    // send the sync data to the server and check if there's sync data coming back
    const response = await fetch(new URL('sync/chrome', HOST).toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(Array.from(changes.getAllchanges())),
    });
    if (response.ok) {
      const res = await response.json();
      const { processedChangeIds } = res;
      if (!!processedChangeIds && Array.isArray(processedChangeIds)) {
        await Promise.all(processedChangeIds.map(changes.delete.bind(changes)));
      } else {
        console.error('invalid sync response', processedChangeIds);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const requestSync = async (): Promise<void> => {
  const response = await fetch(new URL('sync/chrome', HOST).toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'GET',
  });
  if (response.ok && response.status === 200) {
    const incomingChanges: [string, BookmarkChange][] = await response.json();
    if (
      !Array.isArray(incomingChanges) ||
      incomingChanges.some((ic) => {
        if (!Array.isArray(ic)) return true;
        const [id, change] = ic;
        return typeof id !== 'string' || !isBoookmarkChange(change);
      })
    ) {
      console.error('invalid sync request response', incomingChanges);
      return;
    }

    const processedChangeIds: string[] = [];
    for (const ic of incomingChanges) {
      const [changeId, change] = ic;
      if (change.kind === BookmarkChangeKind.Add) {
        const { kind, timestamp, ...bookmark } = change;
        if (isFromTuiApp(bookmark.id) || !hashes.has(bookmark.id)) {
          // we create a new bookmark
          await chrome.bookmarks.create({
            title: bookmark.title,
            url: bookmark.url,
          });
        } else {
          // we update an existing bookmark
          try {
            ignoreSyncIds.add(bookmark.id);
            await chrome.bookmarks.update(bookmark.id, {
              title: bookmark.title,
              url: bookmark.url,
            });
            processedChangeIds.push(changeId);
          } catch (e) {
            ignoreSyncIds.delete(bookmark.id);
            console.info('Could not update bookmark "' + bookmark.id + '"');
          }
        }
      } else if (change.kind === BookmarkChangeKind.Remove) {
        try {
          ignoreSyncIds.add(change.id);
          await chrome.bookmarks.remove(change.id);
        } catch (e) {
          console.info('Could not remove bookmark "' + change.id + '"');
        } finally {
          // in case of remove failure we still confirm the sync
          processedChangeIds.push(changeId);
        }
      }
    }
    await confirmSync(processedChangeIds);
  }
};

const confirmSync = async (processedChangeIds: string[]): Promise<void> => {
  const response = await fetch(new URL('sync/confirm', HOST).toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(processedChangeIds),
  });
  if (response.ok) {
    return;
  }
  console.warn('confirm sync failed', response);
};

export const heartbeat = async (): Promise<void> => {
  const isAlive = await isHostAlive();
  if (isAlive && lastHostStatus !== HostStatus.Alive) {
    await updateIcon(true);
  } else if (!isAlive && lastHostStatus !== HostStatus.Inactive) {
    await updateIcon(false);
  }
  lastHostStatus = isAlive ? HostStatus.Alive : HostStatus.Inactive;
  if (isAlive) {
    if (changes.size > 0) {
      await sync();
    }
    await requestSync();
  }
};
