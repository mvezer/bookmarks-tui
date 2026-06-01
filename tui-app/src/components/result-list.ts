import { ScrollBoxRenderable, CliRenderer } from "@opentui/core";
import { ResultItem } from "./result-item";
import { EventBus, KeymapEvents, BookmarkEvents } from "../events";

import type { Bookmark } from "@bookmarks-tui/common";

export class ResultList extends ScrollBoxRenderable {
  private _items: ResultItem[] = [];
  private _selectedIndex = 0;
  constructor(private _renderer: CliRenderer) {
    super(_renderer, {
      width: "100%",
      scrollY: true,
      viewportCulling: true,
    });
    EventBus.on(KeymapEvents.moveUp, () => {
      this.prevItem();
    });
    EventBus.on(KeymapEvents.moveDown, () => {
      this.nextItem();
    });
    EventBus.on(KeymapEvents.enter, () => {
      EventBus.emit(BookmarkEvents.selectBookmark, this.selectedBookmark);
    });
    EventBus.on(KeymapEvents.requestDelete, () => {
      EventBus.emit(BookmarkEvents.deleteBookmark, this.selectedBookmark);
    });
  }

  clear() {
    this._items.forEach((item) => item.destroy());
    this._items = [];
  }

  set items(bookmarks: Bookmark[]) {
    this.clear();

    for (const b of bookmarks) {
      const item = new ResultItem(this._renderer, b);
      this._items.push(item);
      this.add(item);
    }
    this.selectedIndex = 0;
  }

  _applySelected(value: number) {
    if (value >= this._items.length) {
      value = this._items.length - 1;
    } else if (value < 0) {
      value = 0;
    }
    this._items[this._selectedIndex]!.selected = false;
    this._selectedIndex = value;
    this._items[this._selectedIndex]!.selected = true;
    this.scrollTo(Math.max(0, this._selectedIndex - this.height + 3));
    EventBus.emit(BookmarkEvents.currentBookmarkChanged, this.selectedBookmark);
  }

  nextItem() {
    this.selectedIndex++;
  }

  prevItem() {
    this.selectedIndex--;
  }

  set selectedIndex(value: number) {
    this._applySelected(value);
  }
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  get selectedBookmark(): Bookmark | undefined {
    return this._items[this._selectedIndex]?.bookmark;
  }
}
