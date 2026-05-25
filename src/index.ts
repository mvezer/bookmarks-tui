import { Bookmarks } from "./bookmarks/bookmarks";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { EventBus, BookmarkEvents, KeymapEvents } from "./events";
import { TUI } from "./components/tui";
import { createKeymap } from "./keymap";
import { openUrl } from "./browser";
import { yesNoDialog } from "./components/yesno-dialog";
import { setupCliArgs } from "./cli-args";

const setupEventHandlers = (bookmarks: Bookmarks) => {
  EventBus.on(BookmarkEvents.searchBookmark, (query: string) => {
    tui.searchResults = bookmarks.search(query);
  });

  EventBus.on(BookmarkEvents.selectBookmark, (bookmarkEntry: any) => {
    openUrl(bookmarkEntry.url);
  });

  EventBus.on(BookmarkEvents.currentBookmarkChanged, (bookmarkEntry: any) => {
    tui.currentBookmark = bookmarkEntry;
  });

  EventBus.on(BookmarkEvents.deleteBookmark, (bookmarkEntry: any) => {
    console.log(bookmarkEntry);
    yesNoDialog(
      cliRenderer,
      `Are you sure you want to delete "${bookmarkEntry.name}"?`,
      () => {
        bookmarks.deleteBookmark(bookmarkEntry);
        tui.searchResults = bookmarks.bookmarkEntries;
        bookmarks.save();
      },
      () => {},
    );
  });

  EventBus.on(KeymapEvents.quit, () => {
    process.exit(0);
  });
};

const { importOptions, mainOptions } = setupCliArgs();

const bookmarks = new Bookmarks(mainOptions.path);
setupEventHandlers(bookmarks);
bookmarks.load();

if (mainOptions.command === "import" && importOptions) {
  if (importOptions.source === "chrome") {
    console.log("Importing bookmarks from Chrome");
    bookmarks.importFromChrome(importOptions.importPath);
  } else if (importOptions.source === "html") {
    console.log(`Importing bookmarks from HTML ${importOptions.importPath}`);
    bookmarks.importFromHtml(importOptions.importPath);
  }
  process.exit(0);
}

const cliRenderer = await createCliRenderer({
  consoleOptions: {
    position: ConsolePosition.BOTTOM, // Position on screen
    sizePercent: 30, // Size as percentage of terminal
    colorInfo: "#00FFFF", // Color for console.info
    colorWarn: "#FFFF00", // Color for console.warn
    colorError: "#FF0000", // Color for console.error
    startInDebugMode: false, // Show file/line info in logs
  },
});
const tui = new TUI(cliRenderer);

// initialize result list
tui.searchResults = bookmarks.bookmarkEntries;

createKeymap(cliRenderer);
