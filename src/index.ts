import { Bookmarks } from "./bookmarks/bookmarks";
import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { EventBus, BookmarkEvents } from "./events";
import { TUI } from "./components/tui";
import { createKeymap } from "./keymap";
import { openUrl } from "./browser";
import commandLineArgs from "command-line-args";
import { yesNoDialog } from "./components/yesno-dialog";

const mainDefinitions = [
  { name: "command", type: String, defaultOption: true },
  { name: "path", alias: "p", type: String },
];

const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
});
const argv = mainOptions._unknown || [];

const bookmarks = new Bookmarks(mainOptions.path);
bookmarks.load();

if (mainOptions.command === "import") {
  const importDefinitions = [
    { name: "importPath", type: String },
    { name: "source", alias: "s", type: String, defaultValue: "html" },
  ];
  const importOptions = commandLineArgs(importDefinitions, { argv });
  if (importOptions.source === "chrome") {
    console.log("Importing bookmarks from Chrome");
    bookmarks.importFromChrome(importOptions.importPath);
  } else if (importOptions.source === "html") {
    if (!importOptions.importPath) {
      console.error("No import path provided!");
      process.exit(1);
    }
    console.log(`Importing bookmarks from HTML ${importOptions.importPath}`);
    bookmarks.importFromHtml(importOptions.importPath);
  } else {
    console.error(
      `Source "${importOptions.source}" is not supported (currently only html and chrome import is supported)`,
    );
    process.exit(1);
  }
  process.exit(0);
}

// bookmarks.load();

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
