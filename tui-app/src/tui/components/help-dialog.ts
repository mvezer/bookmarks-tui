import {
  CliRenderer,
  TextRenderable,
  RGBA,
  BoxRenderable,
  type TextOptions,
} from '@opentui/core';
import { BaseDialog } from './base-dialog';
import { Keymap } from '../keymap';

const BG_COLOR_NORMAL = '#000000ff';
const CLOSE_MESSAGE = '(esc to close)';
const GENERAL_TITLE = 'General key bindings';
const DIALOG_TITLE = 'Dialog key bindings';

class HelpDialog extends BaseDialog {
  constructor(renderer: CliRenderer) {
    const generateTitle = (
      content: string,
      props: Partial<TextOptions> = { marginBottom: 1 },
    ): TextRenderable => {
      return new TextRenderable(renderer, {
        content,
        width: 'auto',
        alignSelf: 'center',
        height: 1,
        ...props,
      });
    };
    const generateLine = (key: string, description: string): BoxRenderable => {
      const line = new BoxRenderable(renderer, {
        width: 'auto',
        flexDirection: 'row',
      });
      const left = new BoxRenderable(renderer, {
        width: keysMaxWidth,
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 1,
      });
      const right = new BoxRenderable(renderer, {
        width: 'auto',
        height: 'auto',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingLeft: 1,
      });
      left.add(
        new TextRenderable(renderer, {
          content: key,
        }),
      );
      right.add(
        new TextRenderable(renderer, {
          content: description,
        }),
      );
      line.add(left);
      line.add(right);
      return line;
    };

    super(
      renderer,
      {},
      {
        id: `help-dialog`,
        width: 'auto',
        height: 'auto',
        border: true,
        borderStyle: 'double',
        backgroundColor: RGBA.fromHex(BG_COLOR_NORMAL),
        position: 'absolute',
        alignSelf: 'center',
        top: 'auto',
        paddingX: 4,
        paddingY: 1,
      },
    );
    const { general, dialog } = Keymap.instance.generateHelpText();
    const keysMaxWidth =
      Math.max(
        Math.max(...general.map(([key]) => key.length)),
        Math.max(...dialog.map(([key]) => key.length)),
      ) + 1;

    this.add(generateTitle(GENERAL_TITLE));
    general.forEach(([key, description]) => {
      this.add(generateLine(key, description));
    });
    this.add(generateTitle(DIALOG_TITLE, { marginY: 1 }));
    dialog.forEach(([key, description]) => {
      this.add(generateLine(key, description));
    });
    this.add(generateTitle(CLOSE_MESSAGE, { marginTop: 1 }));
  }
}

export const helpDialog = (renderer: CliRenderer): void => {
  new HelpDialog(renderer).show();
};
