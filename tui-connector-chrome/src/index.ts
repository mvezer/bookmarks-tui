import { ALARM_NAME } from './constants';
import { Metrics } from './storage/metrics';
import { Settings } from './storage/settings';
import { Tracking } from './storage/tracking';
import {
  BookmarkTree,
  BookmarkTreeNode,
  TraverseFilters,
  createBookmarkFromTreeNode,
} from './bookmarks-tree';
import { BOOKMARKS_TUI_FOLDER_NAME } from './constants';
import { v4 as uuidv4 } from 'uuid';
import { HostStatus, getHostStatus, sendSyncRequest } from './rest';
import { isSyncDataEmpty, mergeSyncData } from '@bookmarks-tui/common/sync';
import { Sync } from './sync';
import {
  ChromeBookmarkEventChangeKind,
  ChromeBookmarkEventIgnoreMap,
} from './ignore-map';

let sync: Sync;
const ignoreMap = new ChromeBookmarkEventIgnoreMap();
let lastHostStatus: HostStatus = HostStatus.Unknown;

const initSettings = async (bookmarkTree: BookmarkTree): Promise<void> => {
  await Settings.create();

  // if there's no clientId yet, create one and save it
  if (!Settings.instance.get('clientId')) {
    Settings.instance.set('clientId', uuidv4());
  }

  if (!Settings.instance.get('bookmarksTuiFolderId')) {
    let bookmarksTuiFolderId = bookmarkTree
      .traverse(TraverseFilters.bookmarksTuiFolder)
      ?.pop()?.id;
    // if the bookmarksTuiFolder doesn't exist, create it
    if (!bookmarksTuiFolderId) {
      // try to figure out the bookmarks bar folder id (or use '1' if not found - which is the default)
      const bookmarksBarFolderId =
        bookmarkTree.traverse(TraverseFilters.bookmarksBarFolder)?.pop()?.id ||
        '1';
      bookmarksTuiFolderId = (
        await bookmarkTree.createNode({
          title: BOOKMARKS_TUI_FOLDER_NAME,
          parentId: bookmarksBarFolderId,
        })
      )?.id;
      if (!bookmarksTuiFolderId) {
        console.error('Failed to create bookmarksTuiFolder');
      }
    }
    Settings.instance.set('bookmarksTuiFolderId', bookmarksTuiFolderId);
  }
};

const initTracking = async (bookmarkTree: BookmarkTree): Promise<void> => {
  await Tracking.create();
  for (const node of bookmarkTree.traverse(TraverseFilters.bookmarks)) {
    await Tracking.instance.setBookmark(
      createBookmarkFromTreeNode(node),
      node.id,
    );
  }
};

const initAlarm = async (): Promise<void> => {
  const alarm = await chrome.alarms.get(ALARM_NAME);
  if (!alarm) {
    await chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: Settings.instance.get('heartbeatIntervalMinutes'),
    });
  }
};

const setupEvents = async (): Promise<void> => {
  chrome.bookmarks.onCreated.addListener((id, bookmark) => {
    onBookmarkCreated(id, bookmark);
  });

  chrome.bookmarks.onRemoved.addListener(async (id: string) => {
    await onBookmarkRemoved(id);
  });

  chrome.bookmarks.onChanged.addListener(async (id, bookmark) => {
    onBookmarkChanged(id, bookmark as BookmarkTreeNode);
  });
  chrome.bookmarks.onMoved.addListener(async (id, moveInfo) => {
    await onBookmarkMoved(id, moveInfo);
  });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) {
      await heartbeat();
    }
  });
};
const init = async (): Promise<void> => {
  // creat storage entities
  await Metrics.create();
  const bookmarkTree = new BookmarkTree();
  await bookmarkTree.init();
  await initSettings(bookmarkTree);
  await initTracking(bookmarkTree);
  await initAlarm();
  setupEvents();
  sync = new Sync(ignoreMap);
};

export const onBookmarkCreated = async (
  _: string,
  bookmarkTreeNode: BookmarkTreeNode,
) => {
  // it's a folder, we don't care about it
  if (bookmarkTreeNode.url === undefined) {
    return;
  }
  if (
    ignoreMap.checkAndDelete(
      bookmarkTreeNode.id,
      ChromeBookmarkEventChangeKind.Add,
    )
  ) {
    return;
  }
  setTimeout(
    async () =>
      Tracking.instance.setBookmark(
        createBookmarkFromTreeNode(bookmarkTreeNode),
        bookmarkTreeNode.id,
      ),
    500,
  ); // it's an ugly hack to make sure the bookmark recentChanges entry is created before
};

export const onBookmarkRemoved = async (id: string) => {
  if (ignoreMap.checkAndDelete(id, ChromeBookmarkEventChangeKind.Remove)) {
    return;
  }
  setTimeout(async () => {
    await Tracking.instance.removeBookmarkById(id);
  }, 500); // it's an ugly hack to make sure the bookmark recentChanges entry is created before
};

export const onBookmarkChanged = async (
  id: string,
  bookmarkChangedData: Omit<BookmarkTreeNode, 'id'>,
) => {
  // it's a folder, we don't care about it
  if (bookmarkChangedData.url === undefined) {
    return;
  }

  if (ignoreMap.checkAndDelete(id, ChromeBookmarkEventChangeKind.Update)) {
    return;
  }
  setTimeout(async () => {
    await Tracking.instance.setBookmark(
      createBookmarkFromTreeNode({
        ...bookmarkChangedData,
        id,
      }),
      id,
    );
  }, 500); // it's an ugly hack to make sure the bookmark recentChanges entry is created before
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

export const heartbeat = async (): Promise<void> => {
  const currentHostStatus = await getHostStatus();
  if (currentHostStatus !== lastHostStatus) {
    await updateIcon(currentHostStatus);
  }
  lastHostStatus = currentHostStatus;
  if (currentHostStatus === HostStatus.Alive) {
    let syncData = mergeSyncData([{}, Tracking.instance.syncData]);
    let firstIteration = true;
    while (firstIteration || !isSyncDataEmpty(syncData)) {
      firstIteration = false;
      try {
        syncData.clientId = Settings.instance.get('clientId');
        const syncResponse = await sendSyncRequest(syncData);
        syncData = mergeSyncData([
          await sync.process(syncResponse),
          Tracking.instance.syncData,
        ]);
      } catch (e) {
        console.error('sync failed', (e as Error).message || 'Unknown error');
        break;
      }
    }
  }
};

(async () => {
  await init();
})();
