import { Bookmarks } from "./bookmarks/bookmarks";
import { EventBus, BookmarkEvents, KeymapEvents } from "./events";
import { TUI } from "./components/tui";
import { createKeymap } from "./keymap";
import { openUrl } from "./browser";
import { yesNoDialog } from "./components/yesno-dialog";
import { setupCliArgs } from "./cli-args";
import { startHttpServer } from "./http-server";
import type { Bookmark } from "@bookmarks-tui/common";

const setupEventHandlers = (bookmarks: Bookmarks) => {
  EventBus.on(BookmarkEvents.searchBookmark, (query: string) => {
    console.log("search", query);
    tui.searchResults = bookmarks.search(query);
  });

  EventBus.on(BookmarkEvents.selectBookmark, (bookmarkEntry: any) => {
    openUrl(bookmarkEntry.url);
  });

  EventBus.on(BookmarkEvents.currentBookmarkChanged, (bookmarkEntry: any) => {
    tui.currentBookmark = bookmarkEntry;
  });

  EventBus.on(BookmarkEvents.deleteBookmark, (bookmark: Bookmark) => {
    yesNoDialog(
      tui.renderer,
      `Are you sure you want to delete "${bookmark.title}"?`,
      () => {
        bookmarks.delete(bookmark);
        tui.searchResults = bookmarks.search(tui.searchQuery);
        bookmarks.save();
      },
      () => {},
    );
  });

  EventBus.on(KeymapEvents.quit, () => {
    process.exit(0);
  });
  EventBus.on(BookmarkEvents.receivedBookmarks, (message: any) => {
    console.log("Received bookmarks:", message);
  });
  EventBus.on(BookmarkEvents.syncedBookmarks, () => {
    tui.resetSearch();
    tui.searchResults = bookmarks.getAll();
  });
};

const { importOptions, mainOptions } = setupCliArgs();

const bookmarks = new Bookmarks(mainOptions.path);
setupEventHandlers(bookmarks);
bookmarks.load();

if (mainOptions.command === "import" && importOptions) {
  console.log(`Importing bookmarks from HTML ${importOptions.importPath}`);
  bookmarks.importFromHtml(importOptions.importPath);

  process.exit(0);
}

const tui = await TUI.create();

// initialize result list
tui.searchResults = bookmarks.getAll();

startHttpServer({
  onStatus: () => "ok",
  onSyncReceived: bookmarks.sync.bind(bookmarks),
  onSyncRequested: () => {
    return bookmarks.syncItems;
  },
  onSyncConfirmed: () => bookmarks.confirmSync.bind(bookmarks),
});

createKeymap(tui.renderer);
