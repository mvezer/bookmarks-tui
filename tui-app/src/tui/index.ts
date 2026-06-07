import { ResultList } from './components/result-list';
import { Keymap, KeymapEvents } from './keymap';
import { type Bookmark } from '@bookmarks-tui/common';
import { StatusBar } from './components/status-bar';
import { TUIEventBus, TUIEvents } from './tui-events';

import {
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  CliRenderer,
} from '@opentui/core';
import { helpDialog } from './components/help-dialog';

export class TUI extends BoxRenderable {
  private _renderer: CliRenderer;
  private _searchBox: BoxRenderable;
  private _searchInput: InputRenderable;
  private _resultList: ResultList;
  private _statusBar: StatusBar;

  constructor(renderer: CliRenderer) {
    super(renderer, {
      id: 'tui',
      width: '100%',
      height: '100%',
      border: false,
    });

    this._renderer = renderer;

    this._searchBox = new BoxRenderable(renderer, {
      id: 'search-box',
      width: '100%',
      height: 3,
      border: true,
      title: 'Search',
    });
    this._searchInput = new InputRenderable(renderer, {
      id: 'search-input',
      width: '100%',
      placeholder: 'bookmark name',
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
      TUIEventBus.instance.emit(TUIEvents.SearchQueryChanged, query);
    });
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
      console.log('help');
      helpDialog(renderer);
    });
  }

  get searchQuery(): string {
    return this._searchInput.value;
  }

  set bookmarks(bookmarks: Bookmark[]) {
    this._resultList.items = bookmarks;
  }
  resetSearch(): void {
    if (this._searchInput.value !== '') {
      this._searchInput.value = '';
      TUIEventBus.instance.emit(TUIEvents.SearchQueryChanged);
    }
  }
  set currentBookmark(bookmark: Bookmark | undefined) {
    this._statusBar.currentBookmark = bookmark;
  }

  get renderer(): CliRenderer {
    return this._renderer;
  }
}
