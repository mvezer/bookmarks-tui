import {
  BoxRenderable,
  TextRenderable,
  CliRenderer,
  RGBA,
} from '@opentui/core';
import type { ColorScheme } from '../../colorscheme';

export interface ToastOptions {
  text: string;
  timeout: number;
  backgroundColor: RGBA;
  foregroundColor: RGBA;
  borderColor: RGBA;
}
export class Toast extends BoxRenderable {
  constructor(
    private _renderer: CliRenderer,
    colorScheme: ColorScheme,
    options: ToastOptions,
  ) {
    super(_renderer, {
      width: '100%',
      height: 'auto',
      zIndex: 100,
      border: true,
      borderStyle: 'double',
      backgroundColor: options.backgroundColor || colorScheme.dialogBackground,
      borderColor: options.borderColor || colorScheme.dialogBorder,
      position: 'absolute',
      alignSelf: 'center',
      bottom: 0,
      paddingX: 4,
      paddingY: 0,
    });

    this.add(
      new TextRenderable(_renderer, {
        content: options.text,
        width: '100%',
        alignSelf: 'center',
        height: 'auto',
        fg: options.foregroundColor || colorScheme.dialogForeground,
      }),
    );
    setTimeout(() => {
      this.hide.bind(this)();
    }, options.timeout);
  }

  show(): void {
    this._renderer.root.add(this);
  }

  hide(): void {
    this.destroy();
  }
}
