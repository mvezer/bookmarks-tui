import { BoxRenderable, CliRenderer, TextRenderable } from '@opentui/core';
import { type Bookmark } from '@bookmarks-tui/common';
import type { ColorScheme } from '../../colorscheme';

export class ResultItem extends BoxRenderable {
  private _selected = false;
  private _text: TextRenderable;
  constructor(
    renderer: CliRenderer,
    private _bookmark: Bookmark,
    private _colorScheme: ColorScheme,
  ) {
    super(renderer, {
      id: `result-item-${_bookmark.id}`,
      width: '100%',
      height: 1,
    });
    this._text = new TextRenderable(renderer, {
      content: _bookmark.title,
    });
    this.add(this._text);
    this._applySelected();
  }
  get bookmark(): Bookmark {
    return this._bookmark;
  }

  private _applySelected() {
    this._backgroundColor = this._selected
      ? this._colorScheme.selectedBackground
      : this._colorScheme.background;
    this._text.fg = this._selected
      ? this._colorScheme.selectedForeground
      : this._colorScheme.foreground;
  }

  set selected(value: boolean) {
    this._selected = value;
    this._applySelected();
  }

  get selected(): boolean {
    return this._selected;
  }
}
