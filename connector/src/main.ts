import {
  Bookmark,
  PORT,
  createBookmark,
  BookmarkChange,
  BookmarkChangeRepository,
  isBoookmarkChange,
  BookmarkChangeKind,
  ReverseLookupFieldMap,
} from '@bookmarks-tui/common';
import { BookmarkTrackingPayload, Storage } from './storage';

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode & {
  trash?: boolean;
};

let tracking = new ReverseLookupFieldMap<
  string,
  BookmarkTrackingPayload,
  'hash'
>('hash');
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
// The `ignoreSyncIds` set holds the ids of the bookmarks we don't want to sync (It's used when receiving change information and applying sync)
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
      // TODO: check if this "else if" is actually needed here
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

export const isHostAlive = async (): Promise<boolean> => {
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
    tracking = new ReverseLookupFieldMap<
      string,
      BookmarkTrackingPayload,
      'hash'
    >('hash', Object.entries(await storage.getAllBookmarkTracking()));
    await changes.init();
    // these are the bookmarks that are not tracked yet
    const bookmarksToAdd = chromeBookmarks.filter((b) => {
      return tracking.get(b.id)?.hash !== b.hash;
    });
    // ...so we add their hashes to the storage
    await Promise.all(
      bookmarksToAdd.map(async (b) => {
        const { hash, modified } = b;
        await storage.setBookmarkTracking({ [b.id]: { hash, modified } });
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
  const { hash, modified } = newBookmark;
  tracking.set(newBookmark.id, { hash, modified });
  storage.stats.bookmarks++;
  await storage.saveStats();
  if (!ignoreSyncIds.has(newBookmark.id)) {
    changes.add(newBookmark);
  } else {
    ignoreSyncIds.delete(newBookmark.id);
  }
};

export const onBookmarkRemoved = async (bookmarkId: string) => {
  storage.stats.bookmarks--;
  await storage.saveStats();
  if (!ignoreSyncIds.has(bookmarkId)) {
    changes.add(bookmarkId);
  } else {
    ignoreSyncIds.delete(bookmarkId);
  }
  tracking.delete(bookmarkId);
};

export const onBookmarkChanged = async (
  bookmarkId: string,
  bookmarkChangedData: Omit<BookmarkTreeNode, 'id'>,
) => {
  const bookmark = createBookmarkFromTreeNode({
    ...bookmarkChangedData,
    id: bookmarkId,
  });
  tracking.delete(bookmarkId);
  const { hash, modified } = bookmark;
  tracking.set(bookmarkId, { hash, modified });
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
  try {
    // send the sync data to the server and check if there's sync data coming back
    const response = await fetch(new URL('sync/chrome', HOST).toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(Array.from(changes.getAllchanges())),
    });
    storage.stats.changesSent += changes.size;
    await storage.saveStats();
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
    storage.stats.changesReceived += incomingChanges.length;
    for (const ic of incomingChanges) {
      const [changeId, change] = ic;
      if (change.kind === BookmarkChangeKind.Add) {
        const idMatch = tracking.get(change.id);
        const hashMatch = tracking.reverseGet(change.hash);
        const { kind, timestamp, ...newOrModifiedBookmark } = change;
        // TODO: fix the sync logic
        // - if no id match and no hash match -> create
        // - if id match and no hash match and modified date is newer -> update
        // - rest is skipped
        // we create the bookmark if that was created by the TUI app or if we don't have the tracking info for this id yet
        if (!idMatch && !hashMatch) {
          await chrome.bookmarks.create({
            title: newOrModifiedBookmark.title,
            url: newOrModifiedBookmark.url,
          });
          // we update the bookmark if the incoming change is newer than the existing one' last modified date
        } else if (
          idMatch &&
          !hashMatch &&
          idMatch.modified < newOrModifiedBookmark.modified
        ) {
          try {
            ignoreSyncIds.add(newOrModifiedBookmark.id); // we don't want to sync this change back to the host
            await chrome.bookmarks.update(newOrModifiedBookmark.id, {
              title: newOrModifiedBookmark.title,
              url: newOrModifiedBookmark.url,
            });
            processedChangeIds.push(changeId);
          } catch (e) {
            ignoreSyncIds.delete(newOrModifiedBookmark.id);
            console.info(
              'Could not update bookmark "' + newOrModifiedBookmark.id + '"',
            );
          }
          // we skip othewise...
        } else {
          processedChangeIds.push(changeId); // we just confirm the sync without doing anything
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
    storage.stats.changesProcessed += processedChangeIds.length;
    await storage.saveStats();
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
