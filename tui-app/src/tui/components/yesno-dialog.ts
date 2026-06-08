import { CliRenderer, TextRenderable } from '@opentui/core';
import { BaseDialog, type DialogOptions } from './base-dialog';
import type { ColorScheme } from '../../colorscheme';
import { Keymap, KeymapEvents } from '../keymap';

class YesNoDialog extends BaseDialog {
  constructor(
    renderer: CliRenderer,
    colorScheme: ColorScheme,
    text: string,
    dialogOptions: DialogOptions,
  ) {
    super(renderer, colorScheme, dialogOptions, {
      id: `yesno-dialog`,
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

export const yesNoDialog = (
  renderer: CliRenderer,
  colorScheme: ColorScheme,
  text: string,
  onYes: () => void,
  onNo: () => void,
): void => {
  const ynd = new YesNoDialog(renderer, colorScheme, text, {
    yesHandler: onYes,
    noHandler: onNo,
  });
  ynd.show();
};
