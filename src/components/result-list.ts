import { ScrollBoxRenderable, CliRenderer } from "@opentui/core";
import { ResultItem } from "./result-item";
import { EventBus, KeymapEvents, BookmarkEvents } from "../events";

import type { BookmarkEntry } from "../bookmarks";
export class ResultList extends ScrollBoxRenderable {
  private _items: ResultItem[] = [];
  private _selectedIndex = 0;
  constructor(private renderer: CliRenderer) {
    super(renderer, {
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
      EventBus.emit(
        BookmarkEvents.selectBookmark,
        this._items[this._selectedIndex]!.bookmarkEntry,
      );
    });
  }

  clear() {
    this._items.forEach((item) => item.destroy());
    this._items = [];
  }

  set items(bookmarkEntry: BookmarkEntry[]) {
    this.clear();

    let i = 0;
    for (const b of bookmarkEntry) {
      const item = new ResultItem(this.renderer, b, i++);
      this._items.push(item);
      this.add(item);
    }
    this.selectedIndex = 0;
  }

  _applySelected(value: number) {
    console.log(value, this._items.length);
    if (value >= this._items.length) {
      value = this._items.length - 1;
    } else if (value < 0) {
      value = 0;
    }
    this._items[this._selectedIndex]!.selected = false;
    this._selectedIndex = value;
    this._items[this._selectedIndex]!.selected = true;
    this.scrollTo(Math.max(0, this._selectedIndex - this.height + 3));
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
}
