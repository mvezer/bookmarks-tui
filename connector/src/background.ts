import {
  heartbeat,
  onBookmarkCreated,
  onBookmarkRemoved,
  onBookmarkChanged,
  onBookmarkMoved,
  init,
  type BookmarkTreeNode,
} from './main.js';

let heartbeatInterval: ReturnType<typeof setInterval> | undefined;
let alarm;

const run = async () => {
  if (heartbeatInterval !== undefined) {
    return;
  }

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

  chrome.alarms.onAlarm.addListener(async () => {
    await heartbeat();
  });

  await init();
};

(async () => {
  alarm = await chrome.alarms.get('bookmarks-tui-connector-heartbeat');

  if (!alarm) {
    await chrome.alarms.create('bookmarks-tui-connector-heartbeat', {
      periodInMinutes: 1 / 12,
    });
  }
  await run();
})();
