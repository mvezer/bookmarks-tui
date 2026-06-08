import {
  CliRenderer,
  TextRenderable,
  RGBA,
  BoxRenderable,
  type TextOptions,
} from '@opentui/core';
import { BaseDialog } from './base-dialog';
import { Keymap, KeymapEvents } from '../keymap';
import type { ColorScheme } from '../../colorscheme';

const BG_COLOR_NORMAL = '#000000ff';
const GENERAL_TITLE = 'General key bindings';
const DIALOG_TITLE = 'Dialog key bindings';

class HelpDialog extends BaseDialog {
  constructor(renderer: CliRenderer, colorScheme: ColorScheme) {
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
      colorScheme,
      {},
      {
        id: `help-dialog`,
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
    this.add(
      generateTitle(
        `${Keymap.instance.getKeymapDefintionsByEvent(KeymapEvents.dialogCancel)[0]?.key} to close`,
        { marginTop: 1 },
      ),
    );
  }
}

export const helpDialog = (
  renderer: CliRenderer,
  colorScheme: ColorScheme,
): void => {
  new HelpDialog(renderer, colorScheme).show();
};
