import {
  Bookmark,
  PORT,
  createBookmark,
  BookmarkChange,
  BookmarkChangeRepository,
  isBoookmarkChange,
  BookmarkChangeKind,
  ReverseLookupFieldMap,
  isFromTuiApp,
  BookmarkCreateData,
} from '@bookmarks-tui/common';
import { BookmarkTrackingPayload, Storage } from './storage';
import {
  traverseBookmarkTree,
  BookmarkTreeNode,
  traverseFilters,
} from './bookmark-tree';
import { BOOKMARKS_TUI_FOLDER_NAME } from './constants';

let tracking = new ReverseLookupFieldMap<
  string,
  BookmarkTrackingPayload,
  'hash'
>('hash');
const storage = new Storage();
let changes: BookmarkChangeRepository = new BookmarkChangeRepository(storage);

export enum HostStatus {
  Unknown,
  Alive,
  Inactive,
}

let lastHostStatus: HostStatus = HostStatus.Unknown;

let isInitialized = false;

const recentChanges = new Map<
  string,
  { changeKind: BookmarkChangeKind; hash: string | undefined }
>(); // id -> hash temporary map to prevent the bookmark to be tracked twice and re-synced when syncing

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
const parseBookmarkTree = (tree: BookmarkTreeNode[]): Bookmark[] => {
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
};

export const getHostStatus = async (): Promise<HostStatus> => {
  try {
    const response = await fetch(new URL('status', HOST).toString());
    if (response.ok) {
      return HostStatus.Alive;
    }
    return HostStatus.Inactive;
  } catch (e) {
    return HostStatus.Inactive;
  }
};

const initBookmarksTuiFolder = async (
  tree: BookmarkTreeNode[],
): Promise<void> => {
  // try to get the Bookmarks TUI folder id from the settings
  let bookmarksTuiFolderId = storage.settings.bookmarksTuiFolderId;

  // if no Bookmarks TUI folder id is found, try to find it in the bookmarks tree
  if (bookmarksTuiFolderId === undefined)
    bookmarksTuiFolderId = traverseBookmarkTree(
      tree,
      traverseFilters.bookmarksTuiFolder,
    ).pop()?.id;

  // if no Bookmarks TUI folder found, let's create one
  if (bookmarksTuiFolderId === undefined) {
    // try to find the bookmarks bar folder
    const bookmarksBarFolderId =
      traverseBookmarkTree(tree, traverseFilters.bookmarksBarFolder).pop()
        ?.id || '1';
    try {
      bookmarksTuiFolderId = (
        await chrome.bookmarks.create({
          title: BOOKMARKS_TUI_FOLDER_NAME,
          parentId: bookmarksBarFolderId,
        })
      ).id;
    } catch (e) {
      console.error('Could not create bookmarks tui folder', e);
    }
  }
  storage.settings.bookmarksTuiFolderId = bookmarksTuiFolderId || '';
  await storage.saveSettings();
};

export const init = async (): Promise<void> => {
  lastHostStatus = HostStatus.Unknown;
  if (isInitialized) {
    return;
  }
  await storage.init();
  await Promise.all([storage.getStats(), storage.getSettings()]);
  const bookmarkTree: BookmarkTreeNode[] = await chrome.bookmarks.getTree();
  const chromeBookmarks = traverseBookmarkTree(bookmarkTree).map(
    (treeNode: BookmarkTreeNode) =>
      createBookmark(treeNode as BookmarkCreateData),
  );
  await initBookmarksTuiFolder(bookmarkTree);
  tracking = new ReverseLookupFieldMap<string, BookmarkTrackingPayload, 'hash'>(
    'hash',
    Object.entries(await storage.getAllBookmarkTracking()),
  );
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
  isInitialized = true;
};

export const onBookmarkCreated = async (
  _: string,
  bookmarkTreeNode: BookmarkTreeNode,
) => {
  // it's a folder, we don't care about it
  if (bookmarkTreeNode.url === undefined) {
    return;
  }
  storage.stats.bookmarks++;
  await storage.saveStats();
  setTimeout(async () => {
    const newBookmark = createBookmarkFromTreeNode(bookmarkTreeNode);
    const { hash, modified } = newBookmark;
    const foundRecentChange = recentChanges.get(newBookmark.id);
    if (
      foundRecentChange &&
      foundRecentChange.changeKind === BookmarkChangeKind.Add &&
      foundRecentChange.hash === hash
    ) {
      recentChanges.delete(newBookmark.id);
      return;
    }
    tracking.set(newBookmark.id, { hash, modified });
    await storage.setBookmarkTracking({ [newBookmark.id]: { hash, modified } });
    changes.add(newBookmark);
  }, 1000); // it's an ugly hack to make sure the bookmark recentChanges entry is created before
};

export const onBookmarkRemoved = async (bookmarkId: string) => {
  storage.stats.bookmarks--;
  await storage.saveStats();
  setTimeout(async () => {
    const foundRecentChange = recentChanges.get(bookmarkId);
    if (
      foundRecentChange &&
      foundRecentChange.changeKind === BookmarkChangeKind.Remove
    ) {
      recentChanges.delete(bookmarkId);
      return;
    }
    changes.add(bookmarkId);
    tracking.delete(bookmarkId);
    await storage.removeBookmarkTracking(bookmarkId);
  }, 1000); // it's an ugly hack to make sure the bookmark recentChanges entry is created before
};

export const onBookmarkChanged = async (
  bookmarkId: string,
  bookmarkChangedData: Omit<BookmarkTreeNode, 'id'>,
) => {
  // it's a folder, we don't care about it
  if (bookmarkChangedData.url === undefined) {
    return;
  }
  setTimeout(async () => {
    const bookmark = createBookmarkFromTreeNode({
      ...bookmarkChangedData,
      id: bookmarkId,
    });
    const { hash, modified } = bookmark;
    const foundRecentChange = recentChanges.get(bookmarkId);
    if (
      foundRecentChange &&
      foundRecentChange.changeKind === BookmarkChangeKind.Add &&
      foundRecentChange.hash === hash
    ) {
      recentChanges.delete(bookmarkId);
      return;
    }
    changes.add(bookmark);
    tracking.set(bookmarkId, { hash, modified });
    await storage.setBookmarkTracking({ [bookmarkId]: { hash, modified } });
  }, 1000); // it's an ugly hack to make sure the bookmark recentChanges entry is created before
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

export const updateIcon = async (hostStatus: HostStatus): Promise<void> => {
  if (hostStatus === HostStatus.Inactive || hostStatus === HostStatus.Unknown) {
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

        // we create the bookmark if that was created by the TUI app or if we don't have the tracking info for this id yet
        if (!idMatch && !hashMatch) {
          try {
            const newBookmark = createBookmarkFromTreeNode(
              await chrome.bookmarks.create({
                parentId: storage.settings.bookmarksTuiFolderId || '1',
                title: newOrModifiedBookmark.title,
                url: newOrModifiedBookmark.url,
              }),
            );
            const { hash, modified } = newBookmark;
            recentChanges.set(newBookmark.id, {
              changeKind: BookmarkChangeKind.Add,
              hash,
            });
            tracking.set(newBookmark.id, { hash, modified });
            await storage.setBookmarkTracking({
              [newBookmark.id]: { hash, modified },
            });
            if (isFromTuiApp(newOrModifiedBookmark.id)) {
              // we sync back the id change to the host
              await changes.add(newBookmark, newOrModifiedBookmark.id);
            }
            processedChangeIds.push(changeId);
          } catch (e) {
            console.info(
              'Could not create bookmark "' + newOrModifiedBookmark.id + '"',
            );
          }
          // we update the bookmark if the incoming change is newer than the existing one' last modified date
        } else if (
          idMatch &&
          !hashMatch &&
          idMatch.modified < newOrModifiedBookmark.modified
        ) {
          try {
            // ignoreSyncIds.add(newOrModifiedBookmark.id); // we don't want to sync this change back to the host
            const updatedBookmark = createBookmarkFromTreeNode(
              await chrome.bookmarks.update(newOrModifiedBookmark.id, {
                title: newOrModifiedBookmark.title,
                url: newOrModifiedBookmark.url,
              }),
            );
            const { hash, modified } = updatedBookmark;
            recentChanges.set(updatedBookmark.id, {
              changeKind: BookmarkChangeKind.Add,
              hash,
            });
            tracking.set(updatedBookmark.id, { hash, modified });
            await storage.setBookmarkTracking({
              [updatedBookmark.id]: { hash, modified },
            });
            processedChangeIds.push(changeId);
          } catch (e) {
            // ignoreSyncIds.delete(newOrModifiedBookmark.id);
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
          // ignoreSyncIds.add(change.id);
          await chrome.bookmarks.remove(change.id);
          recentChanges.set(change.id, {
            changeKind: BookmarkChangeKind.Remove,
            hash: undefined,
          });
          tracking.delete(change.id);
          await storage.removeBookmarkTracking(change.id);
          // await storage
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
  const currentHostStatus = await getHostStatus();
  if (currentHostStatus !== lastHostStatus) {
    await updateIcon(currentHostStatus);
  }
  lastHostStatus = currentHostStatus;
  if (currentHostStatus === HostStatus.Alive) {
    if (changes.size > 0) {
      await sync();
    }
    await requestSync();
  }
};
