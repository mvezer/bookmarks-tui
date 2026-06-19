import { ScrollBoxRenderable, CliRenderer } from '@opentui/core';
import { ResultItem } from './result-item';
import { Keymap, KeymapEvents } from '../keymap';
import { TUIEventBus, TUIEvents } from '../tui-events';

import type { Bookmark } from '@bookmarks-tui/common/bookmarks';
import type { ColorScheme } from '../../colorscheme';

export class ResultList extends ScrollBoxRenderable {
  private _items: ResultItem[] = [];
  private _selectedIndex = 0;
  constructor(
    private _renderer: CliRenderer,
    private _colorScheme: ColorScheme,
  ) {
    super(_renderer, {
      width: '100%',
      scrollY: true,
      viewportCulling: true,
      backgroundColor: _colorScheme.background,
      borderColor: _colorScheme.border,
      border: [],
    });
    Keymap.instance.on(KeymapEvents.nextBookmark, () => {
      this.nextItem();
    });
    Keymap.instance.on(KeymapEvents.previousBookmark, () => {
      this.prevItem();
    });
    Keymap.instance.on(KeymapEvents.halfPageUp, () => {
      this.halfPageUp();
    });
    Keymap.instance.on(KeymapEvents.halfPageDown, () => {
      this.halfPageDown();
    });
    Keymap.instance.on(KeymapEvents.pageUp, () => {
      this.pageUp();
    });
    Keymap.instance.on(KeymapEvents.pageDown, () => {
      this.pageDown();
    });
    Keymap.instance.on(KeymapEvents.goToTop, () => {
      this.goToTop();
    });
    Keymap.instance.on(KeymapEvents.goToBottom, () => {
      this.goToBottom();
    });
    Keymap.instance.on(KeymapEvents.bookmarkAction, () => {
      TUIEventBus.instance.emit(
        TUIEvents.BookmarkActionRequest,
        this.selectedBookmark,
      );
    });
  }

  clear() {
    let item = this._items.pop();
    while (!!item) {
      this.remove(item.id);
      item.destroy();
      item = this._items.pop();
    }
  }

  set items(bookmarks: Bookmark[]) {
    try {
      this.clear();

      for (const b of bookmarks) {
        const item = new ResultItem(this._renderer, b, this._colorScheme);
        this._items.push(item);
        this.add(item);
      }
      this.selectedIndex = 0;
    } catch (e) {
      console.error(e);
    }
  }

  applySelected(value: number) {
    if (this._items.length === 0) {
      return;
    }
    if (value >= this._items.length) {
      value = this._items.length - 1;
    } else if (value < 0) {
      value = 0;
    }

    // if the old selected item does not exist, do nothing (e.g. we deleted the item)
    if (this._items[this._selectedIndex]) {
      // unselect the old selected item
      this._items[this._selectedIndex]!.selected = false;
    }
    this._selectedIndex = value;
    // select the new selected item
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

  halfPageUp() {
    this.applySelected(Math.floor(this.selectedIndex - this.height / 2));
  }

  halfPageDown() {
    this.applySelected(Math.floor(this.selectedIndex + this.height / 2));
  }

  pageUp() {
    this.applySelected(Math.max(0, this.selectedIndex - this.height));
  }

  pageDown() {
    this.applySelected(
      Math.min(this._items.length - 1, this.selectedIndex + this.height),
    );
  }

  goToTop() {
    this.applySelected(0);
  }
  goToBottom() {
    this.applySelected(this._items.length - 1);
  }

  set selectedIndex(value: number) {
    this.applySelected(value);
  }
  get selectedIndex(): number {
    return this._selectedIndex;
  }

  get selectedBookmark(): Bookmark | undefined {
    return this._items[this._selectedIndex]?.bookmark;
  }
}
