import { ScrollBoxRenderable, CliRenderer } from '@opentui/core';
import { ResultItem } from './result-item';
import { Keymap, KeymapEvents } from '../keymap';
import { TUIEventBus, TUIEvents } from '../tui-events';
import { yesNoDialog } from './yesno-dialog';

import type { Bookmark } from '@bookmarks-tui/common';

export class ResultList extends ScrollBoxRenderable {
  private _items: ResultItem[] = [];
  private _selectedIndex = 0;
  constructor(private _renderer: CliRenderer) {
    super(_renderer, {
      width: '100%',
      scrollY: true,
      viewportCulling: true,
    });
    Keymap.instance.on(KeymapEvents.moveUp, () => {
      this.prevItem();
    });
    Keymap.instance.on(KeymapEvents.moveDown, () => {
      this.nextItem();
    });
    Keymap.instance.on(KeymapEvents.enter, () => {
      TUIEventBus.instance.emit(
        TUIEvents.BookmarkActionRequest,
        this.selectedBookmark,
      );
    });
    Keymap.instance.on(KeymapEvents.deleteBookmark, () => {
      if (!this.selectedBookmark) {
        return;
      }
      yesNoDialog(
        this._renderer,
        `Are you sure you want to delete "${this.selectedBookmark.title}"?`,
        () => {
          TUIEventBus.instance.emit(
            TUIEvents.BookmarkDeleteRequest,
            this.selectedBookmark,
          );
        },
        () => {},
      );
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
    if (this._items.length === 0) {
      return;
    }
    if (value >= this._items.length) {
      value = this._items.length - 1;
    } else if (value < 0) {
      value = 0;
    }
    this._items[this._selectedIndex]!.selected = false;
    this._selectedIndex = value;
    this._items[this._selectedIndex]!.selected = true;
    this.scrollTo(Math.max(0, this._selectedIndex - this.height + 3));
    TUIEventBus.instance.emit(
      TUIEvents.BookmarkSelected,
      this.selectedBookmark,
    );
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
