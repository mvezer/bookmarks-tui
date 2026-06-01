import {
  heartbeat,
  onBookmarkCreated,
  onBookmarkRemoved,
  onBookmarkChanged,
  init,
  type BookmarkTreeNode,
} from "./main.js";

const INTERVAL_MS = 1000;

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

  chrome.bookmarks.onRemoved.addListener((id: string) => {
    onBookmarkRemoved(id);
  });

  chrome.bookmarks.onChanged.addListener(async (id, bookmark) => {
    onBookmarkChanged(id, bookmark as BookmarkTreeNode);
  });
  await init();
};

(async () => {
  await run();
})();

chrome.runtime.onStartup.addListener(async () => {
  await run();
});
