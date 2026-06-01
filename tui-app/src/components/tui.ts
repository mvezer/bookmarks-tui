import { createCliRenderer, ConsolePosition } from "@opentui/core";
import { ResultList } from "./result-list";
import { EventBus, BookmarkEvents, KeymapEvents } from "../events";
import { type Bookmark } from "@bookmarks-tui/common";
import { StatusBar } from "./status-bar";

import {
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  CliRenderer,
} from "@opentui/core";

export class TUI extends BoxRenderable {
  private _renderer: CliRenderer;
  private _searchBox: BoxRenderable;
  private _searchInput: InputRenderable;
  private _resultList: ResultList;
  private _statusBar: StatusBar;

  static async create(): Promise<TUI> {
    const renderer = await createCliRenderer({
      consoleOptions: {
        position: ConsolePosition.BOTTOM, // Position on screen
        sizePercent: 30, // Size as percentage of terminal
        colorInfo: "#00FFFF", // Color for console.info
        colorWarn: "#FFFF00", // Color for console.warn
        colorError: "#FF0000", // Color for console.error
        startInDebugMode: false, // Show file/line info in logs
      },
    });
    return new TUI(renderer);
  }

  private constructor(renderer: CliRenderer) {
    super(renderer, {
      id: "tui",
      width: "100%",
      height: "100%",
      border: false,
    });

    this._renderer = renderer;

    this._searchBox = new BoxRenderable(renderer, {
      id: "search-box",
      width: "100%",
      height: 3,
      border: true,
      title: "Search",
    });
    this._searchInput = new InputRenderable(renderer, {
      id: "search-input",
      width: "100%",
      placeholder: "bookmark name",
    });
    this._statusBar = new StatusBar(renderer);
    this._resultList = new ResultList(renderer);
    this._searchBox.add(this._searchInput);
    this.add(this._searchBox);
    this.add(this._resultList);
    this.add(this._statusBar);
    renderer.root.add(this);

    this._searchInput.focus();

    this._searchInput.on(InputRenderableEvents.INPUT, (query: string) => {
      EventBus.emit(BookmarkEvents.searchBookmark, query);
    });
    EventBus.on(KeymapEvents.toggleConsole, () => {
      renderer.console.toggle();
    });
  }

  get searchQuery(): string {
    return this._searchInput.value;
  }

  set searchResults(bookmarks: Bookmark[]) {
    this._resultList.items = bookmarks;
  }
  resetSearch(): void {
    this._searchInput.value = "";
  }
  set currentBookmark(bookmark: Bookmark | undefined) {
    this._statusBar.currentBookmark = bookmark;
  }

  get renderer(): CliRenderer {
    return this._renderer;
  }
}
