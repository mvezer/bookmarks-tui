#!/usr/bin/env bun
import { ResultList } from './components/result-list';
import { Keymap, KeymapEvents } from './keymap';
import { type Bookmark } from '@bookmarks-tui/common';
import { StatusBar } from './components/status-bar';
import { TUIEventBus, TUIEvents } from './tui-events';

import { BoxRenderable, CliRenderer } from '@opentui/core';
import { helpDialog } from './components/help-dialog';
import type { ColorScheme } from '../colorscheme';
import { SearchBox } from './components/search-box';

export class TUI extends BoxRenderable {
  private _renderer: CliRenderer;
  private _colorScheme: ColorScheme;
  private _searchBox: SearchBox;
  private _resultList: ResultList;
  private _statusBar: StatusBar;

  constructor(renderer: CliRenderer, colorScheme: ColorScheme) {
    super(renderer, {
      id: 'tui',
      width: '100%',
      height: '100%',
      border: false,
    });

    this._renderer = renderer;
    this._colorScheme = colorScheme;

    this._searchBox = new SearchBox(renderer, this._colorScheme);
    this._statusBar = new StatusBar(renderer, this._colorScheme);
    this._resultList = new ResultList(renderer, this._colorScheme);
    this.add(this._searchBox);
    this.add(this._resultList);
    this.add(this._statusBar);
    renderer.root.add(this);

    this._searchBox.focus();

    Keymap.instance.on(KeymapEvents.toggleConsole, () => {
      renderer.console.toggle();
    });

    TUIEventBus.instance.on(TUIEvents.BookmarkSelected, (bookmark) => {
      this.currentBookmark = bookmark;
    });

    Keymap.instance.on(KeymapEvents.resetSearch, () => {
      this.resetSearch();
    });

    Keymap.instance.on(KeymapEvents.help, () => {
      helpDialog(renderer, this._colorScheme);
    });
  }

  get searchQuery(): string {
    return this._searchBox.query;
  }

  set bookmarks(bookmarks: Bookmark[]) {
    this._resultList.items = bookmarks;
  }
  resetSearch(): void {
    this._searchBox.reset();
  }
  set currentBookmark(bookmark: Bookmark | undefined) {
    this._statusBar.currentBookmark = bookmark;
  }

  get renderer(): CliRenderer {
    return this._renderer;
  }
}
