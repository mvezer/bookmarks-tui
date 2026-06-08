import {
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  CliRenderer,
} from '@opentui/core';
import type { ColorScheme } from '../../colorscheme';
import { TUIEventBus, TUIEvents } from '../tui-events';
export class SearchBox extends BoxRenderable {
  private _searchInput: InputRenderable;
  constructor(
    private _renderer: CliRenderer,
    private _colorScheme: ColorScheme,
  ) {
    super(_renderer, {
      id: 'search-box',
      width: '100%',
      height: 3,
      border: true,
      title: 'Search',
      backgroundColor: _colorScheme.searchBackground,
      borderColor: _colorScheme.searchBorder,
      borderStyle: 'rounded',
    });
    this._searchInput = new InputRenderable(_renderer, {
      id: 'search-input',
      width: '100%',
      placeholder: 'bookmark name',
    });

    this._searchInput.on(InputRenderableEvents.INPUT, (query: string) => {
      TUIEventBus.instance.emit(TUIEvents.SearchQueryChanged, query);
    });

    this.add(this._searchInput);
  }

  override focus(): void {
    this._searchInput.focus();
  }

  reset(): void {
    if (this._searchInput.value !== '') {
      this._searchInput.value = '';
      TUIEventBus.instance.emit(TUIEvents.SearchQueryChanged);
    }
  }

  get query(): string {
    return this._searchInput.value;
  }
}
