import type { CliRenderer } from '@opentui/core';
import { createOpenTuiKeymap } from '@opentui/keymap/opentui';
import { registerDefaultKeys } from '@opentui/keymap/addons';
import { EventEmitter } from 'node:events';

export enum KeymapEvents {
  nextBookmark = 'nextBookmark',
  previousBookmark = 'previousBookmark',
  quit = 'quit',
  toggleConsole = 'toggleConsole',
  halfPageUp = 'halfPageUp',
  halfPageDown = 'halfPageDown',
  pageDown = 'pageDown',
  pageUp = 'pageUp',
  bookmarkAction = 'bookmarkAction',
  deleteBookmark = 'deleteBookmark',
  dialogYes = 'dialogNo',
  dialogNo = 'dialogYes',
  dialogCancel = 'dialogCancel',
  help = 'help',
  resetSearch = 'resetSearch',
  goToTop = 'goToTop',
  goToBottom = 'goToBottom',
}
export type TKeymap = ReturnType<typeof createOpenTuiKeymap>;

const DEFAULT_KEY_BINDINGS: Array<{ key: string; event: KeymapEvents }> = [
  { key: 'up', event: KeymapEvents.previousBookmark },
  { key: 'down', event: KeymapEvents.nextBookmark },
  { key: 'ctrl+q', event: KeymapEvents.quit },
  { key: 'alt+c', event: KeymapEvents.toggleConsole },
  { key: 'alt+d', event: KeymapEvents.deleteBookmark },
  { key: 'ctrl+u', event: KeymapEvents.halfPageUp },
  { key: 'ctrl+d', event: KeymapEvents.halfPageDown },
  { key: 'ctrl+b', event: KeymapEvents.pageUp },
  { key: 'pageUp', event: KeymapEvents.pageUp },
  { key: 'ctrl+f', event: KeymapEvents.pageDown },
  { key: 'pageDown', event: KeymapEvents.pageDown },
  { key: 'alt+h', event: KeymapEvents.help },
  { key: 'end', event: KeymapEvents.goToBottom },
  { key: 'home', event: KeymapEvents.goToTop },
  { key: 'return', event: KeymapEvents.bookmarkAction },
  { key: 'y', event: KeymapEvents.dialogYes },
  { key: 'n', event: KeymapEvents.dialogNo },
  { key: 'escape', event: KeymapEvents.resetSearch },
  { key: 'escape', event: KeymapEvents.dialogCancel },
];

const BINDINGS_ACTIONS_HELP: Record<keyof typeof KeymapEvents, string> = {
  [KeymapEvents.nextBookmark]: 'Selects the next bookmark',
  [KeymapEvents.previousBookmark]: 'Selects the previous bookmark',
  [KeymapEvents.quit]: 'Exits the Bookmarks TUI',
  [KeymapEvents.toggleConsole]: '',
  [KeymapEvents.deleteBookmark]: 'Deletes the selected bookmark',
  [KeymapEvents.halfPageUp]: 'Scrolls up half a page',
  [KeymapEvents.halfPageDown]: 'Scrolls down half a page',
  [KeymapEvents.pageUp]: 'Scrolls up full page',
  [KeymapEvents.pageDown]: 'Scrolls down a full page',
  [KeymapEvents.goToBottom]: 'Goes to the bottom of the list',
  [KeymapEvents.goToTop]: 'Goes to the top of the list',
  [KeymapEvents.bookmarkAction]: 'Opens the bookmark in the default browser',
  [KeymapEvents.dialogYes]: 'Confirms the dialog (answer yes)',
  [KeymapEvents.dialogNo]: 'Rejects the dialog (answer no)',
  [KeymapEvents.dialogCancel]: 'Cancels the dialog',
  [KeymapEvents.help]: 'Shows this help',
  [KeymapEvents.resetSearch]: 'Resets the search',
};

export class Keymap extends EventEmitter {
  static _instance: Keymap;
  private _bindings: Array<{ key: string; event: KeymapEvents }>;

  static init(renderer: CliRenderer): Keymap {
    if (!Keymap._instance) {
      Keymap._instance = new Keymap(renderer);
    }
    return Keymap._instance;
  }

  private _dialogMode = false;

  override emit(event: KeymapEvents): boolean {
    if (this._dialogMode && !(event as string).startsWith('dialog')) {
      return false;
    }
    return super.emit(event);
  }

  private constructor(renderer: CliRenderer) {
    super();
    // TODO: generate bindings from default bindings + config bindings
    this._bindings = DEFAULT_KEY_BINDINGS;
    const keymap = createOpenTuiKeymap(renderer);
    registerDefaultKeys(keymap);
    const commands = [];
    const bindings = [];
    let i = 0;
    for (const b of this._bindings) {
      const cmd = `command_${i++}`;
      const { key, event } = b;
      bindings.push({ key, cmd });
      commands.push({ name: cmd, run: () => this.emit.bind(this)(event) });
    }
    keymap.registerLayer({ commands, bindings });
  }

  generateHelpText(): {
    general: [string, string][];
    dialog: [string, string][];
  } {
    const generalBindings: Record<keyof typeof KeymapEvents, string[]> =
      {} as Record<keyof typeof KeymapEvents, string[]>;
    const dialogBindings: Record<keyof typeof KeymapEvents, string[]> =
      {} as Record<keyof typeof KeymapEvents, string[]>;
    for (const b of this._bindings) {
      const { key, event } = b;
      if ((event as string).startsWith('dialog')) {
        if (!dialogBindings[event]) {
          dialogBindings[event] = [];
        }
        dialogBindings[event].push(key);
      } else {
        if (!generalBindings[event]) {
          generalBindings[event] = [];
        }
        generalBindings[event].push(key);
      }
    }
    const general: [string, string][] = [];
    const dialog: [string, string][] = [];
    for (const [event, keys] of Object.entries(generalBindings)) {
      if (BINDINGS_ACTIONS_HELP[event as KeymapEvents].length === 0) {
        continue;
      }
      general.push([
        keys.join(', '),
        BINDINGS_ACTIONS_HELP[event as KeymapEvents],
      ] as [string, string]);
    }
    for (const [event, keys] of Object.entries(dialogBindings)) {
      dialog.push([
        keys.join(', '),
        BINDINGS_ACTIONS_HELP[event as KeymapEvents],
      ] as [string, string]);
    }
    return { general, dialog };
  }

  get dialogMode(): boolean {
    return this._dialogMode;
  }

  set dialogMode(value: boolean) {
    this._dialogMode = value;
  }

  static get instance(): Keymap {
    if (!Keymap._instance) {
      throw new Error('Keymap not initialized!');
    }
    return Keymap._instance;
  }
}
