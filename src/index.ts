import { Bookmarks } from "./bookmarks";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { EventBus, BookmarkEvents } from "./events";
import { TUI } from "./components/tui";
import { createKeymap } from "./keymap";
import { openUrl } from "./browser";

const bookmarks = new Bookmarks();
bookmarks.load();
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

EventBus.on(BookmarkEvents.searchBookmark, (query: string) => {
  tui.searchResults = bookmarks.search(query);
});

EventBus.on(BookmarkEvents.selectBookmark, (bookmarkEntry: any) => {
  openUrl(bookmarkEntry.url);
});
