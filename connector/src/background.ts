import {
  heartbeat,
  onBookmarkCreated,
  onBookmarkRemoved,
  onBookmarkChanged,
  onBookmarkMoved,
  init,
  type BookmarkTreeNode,
} from './main.js';

const INTERVAL_MS = 5000;

let heartbeatInterval: ReturnType<typeof setInterval> | undefined;

const run = async () => {
  if (heartbeatInterval !== undefined) {
    return;
  }
  heartbeatInterval = setInterval(async () => {
    await heartbeat();
  }, INTERVAL_MS);

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
  await init();
};

(async () => {
  await run();
})();

chrome.runtime.onStartup.addListener(async () => {
  await run();
});
