import { BoxRenderable, CliRenderer, type RenderContext } from '@opentui/core';
import { Keymap, KeymapEvents } from '../keymap';

export interface DialogOptions {
  yesHandler?: () => void;
  noHandler?: () => void;
  cancelHandler?: () => void;
}

export abstract class BaseDialog extends BoxRenderable {
  protected _lastFocusedRenderable: any;

  constructor(
    protected _renderer: CliRenderer,
    protected _dialogOptions: DialogOptions,
    ...args: ConstructorParameters<typeof BoxRenderable> extends [
      any,
      ...infer Rest,
    ]
      ? Rest
      : never
  ) {
    super(_renderer, ...args);
  }

  show(): void {
    if (Keymap.instance.dialogMode) {
      return;
    }
    Keymap.instance.dialogMode = true;
    // take the focus away from the search input (or anything else)
    this._lastFocusedRenderable = this._renderer.currentFocusedRenderable;
    this._lastFocusedRenderable?.blur();

    this._renderer.root.add(this);
    this.focus();
    // bind the handlers
    if (this._dialogOptions.yesHandler) {
      Keymap.instance.once(KeymapEvents.dialogYes, () => {
        this._dialogOptions.yesHandler!();
        this.hide();
      });
    }
    if (this._dialogOptions.noHandler) {
      Keymap.instance.once(KeymapEvents.dialogNo, () => {
        this._dialogOptions.noHandler!();
        this.hide();
      });
    }
    if (this._dialogOptions.cancelHandler) {
      Keymap.instance.once(KeymapEvents.dialogCancel, () => {
        this._dialogOptions.cancelHandler!();
        this.hide();
      });
    } else {
      // the default cancel handler is bind
      Keymap.instance.once(KeymapEvents.dialogCancel, () => {
        this.hide();
      });
    }
  }

  hide(): void {
    // give back the focus to the renderable
    this._lastFocusedRenderable?.focus();
    Keymap.instance.dialogMode = false;
    this.destroy();
  }
}
