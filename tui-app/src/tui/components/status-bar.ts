import type { Bookmark } from '@bookmarks-tui/common/bookmarks';
import { BoxRenderable, CliRenderer, TextRenderable } from '@opentui/core';
import type { ColorScheme } from '../../colorscheme';

export class StatusBar extends BoxRenderable {
  private _statusText: TextRenderable;
  constructor(renderer: CliRenderer, colorScheme: ColorScheme) {
    super(renderer, {
      id: 'status-bar',
      width: '100%',
      height: 2,
      bottom: 0,
      border: ['top'],
      backgroundColor: colorScheme.statusBackground,
      borderColor: colorScheme.statusBorder,
    });

    this._statusText = new TextRenderable(renderer, {
      content: 'No bookmarks',
      width: '100%',
      height: 1,
      fg: colorScheme.statusForeground,
    });
    this.add(this._statusText);
  }

  set currentBookmark(bookmarkEntry: Bookmark | undefined) {
    if (bookmarkEntry) {
      this._statusText.content = bookmarkEntry.url;
    } else {
      this._statusText.content = '-';
    }
  }
}
