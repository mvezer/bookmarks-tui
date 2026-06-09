import { CliRenderer, TextRenderable } from '@opentui/core';
import { BaseDialog, type DialogOptions } from './base-dialog';
import type { ColorScheme } from '../../colorscheme';
import { Keymap, KeymapEvents } from '../keymap';
import type { Bookmark } from '@bookmarks-tui/common';
import { TUIEventBus, TUIEvents } from '../tui-events';
import { infoToast } from './info-toast';

class DeleteDialog extends BaseDialog {
  constructor(
    renderer: CliRenderer,
    colorScheme: ColorScheme,
    text: string,
    dialogOptions: DialogOptions,
  ) {
    super(renderer, colorScheme, dialogOptions, {
      id: `delete-dialog`,
      backgroundColor: colorScheme.deleteDialogBackground,
      borderColor: colorScheme.deleteDialogBorder,
      top: '50%',
    });

    this.add(
      new TextRenderable(renderer, {
        content: text,
        width: '100%',
        alignSelf: 'center',
        height: 1,
      }),
    );
    const acceptKey = Keymap.instance.getKeymapDefintionsByEvent(
      KeymapEvents.dialogYes,
    )[0]!.key;
    const declineKey = Keymap.instance.getKeymapDefintionsByEvent(
      KeymapEvents.dialogNo,
    )[0]!.key;
    const cancelKey = Keymap.instance.getKeymapDefintionsByEvent(
      KeymapEvents.dialogCancel,
    )[0]!.key;
    this.add(
      new TextRenderable(renderer, {
        content: `(${acceptKey}) to confirm, (${declineKey}) to cancel, (${cancelKey}) to close`,
        width: 'auto',
        alignSelf: 'center',
        marginTop: 1,
        height: 1,
      }),
    );
  }
}

export const deleteDialog = (
  renderer: CliRenderer,
  colorScheme: ColorScheme,
  bookmark: Bookmark,
): void => {
  const text = `Are you sure you want to delete "${bookmark.title}"? (${bookmark.url})`;
  const deleteDialog = new DeleteDialog(renderer, colorScheme, text, {
    yesHandler: () => {
      TUIEventBus.instance.emit(TUIEvents.BookmarkDeleteRequest, bookmark);
      infoToast(renderer, colorScheme, 'Bookmark deleted');
    },
    noHandler: () => {},
  });
  deleteDialog.show();
};
