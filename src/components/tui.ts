import { ResultList } from "./result-list";
import { EventBus, BookmarkEvents, KeymapEvents } from "../events";
import { type BookmarkEntry } from "../bookmarks/types";
import { StatusBar } from "./status-bar";

import {
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  CliRenderer,
} from "@opentui/core";

export class TUI extends BoxRenderable {
  private _searchBox: BoxRenderable;
  private _searchInput: InputRenderable;
  private _resultList: ResultList;
  private _statusBar: StatusBar;

  constructor(renderer: CliRenderer) {
    super(renderer, {
      id: "tui",
      width: "100%",
      height: "100%",
      border: false,
    });

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

  set searchResults(bookmarkEntries: BookmarkEntry[]) {
    this._resultList.items = bookmarkEntries;
  }
  resetSearch(): void {
    this._searchInput.value = "";
  }
  set currentBookmark(bookmarkEntry: BookmarkEntry | undefined) {
    this._statusBar.currentBookmark = bookmarkEntry;
  }
}
