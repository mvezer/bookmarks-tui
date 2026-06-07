import { CliRenderer, TextRenderable, RGBA } from '@opentui/core';
import { BaseDialog, type DialogOptions } from './base-dialog';

const BG_COLOR_NORMAL = '#aa0000ff';
const MESSAGE_POSTFIX = '(y)es or (n)o';

class YesNoDialog extends BaseDialog {
  constructor(
    renderer: CliRenderer,
    text: string,
    dialogOptions: DialogOptions,
  ) {
    super(renderer, dialogOptions, {
      id: `yesno-dialog`,
      width: 'auto',
      height: 5,
      border: true,
      borderStyle: 'double',
      backgroundColor: RGBA.fromHex(BG_COLOR_NORMAL),
      position: 'absolute',
      alignSelf: 'center',
      top: '50%',
      paddingX: 2,
    });

    this.add(
      new TextRenderable(renderer, {
        content: text,
        width: '100%',
        alignSelf: 'center',
        height: 1,
      }),
    );
    this.add(
      new TextRenderable(renderer, {
        content: MESSAGE_POSTFIX,
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
  text: string,
  onYes: () => void,
  onNo: () => void,
): void => {
  const ynd = new YesNoDialog(renderer, text, {
    yesHandler: onYes,
    noHandler: onNo,
  });
  ynd.show();
};
