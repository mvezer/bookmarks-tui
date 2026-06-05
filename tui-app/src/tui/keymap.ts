import type { CliRenderer } from '@opentui/core';
import { createOpenTuiKeymap } from '@opentui/keymap/opentui';
import { registerDefaultKeys } from '@opentui/keymap/addons';
import { EventEmitter } from 'node:events';

export enum KeymapEvents {
  moveUp = 'moveUp',
  moveDown = 'moveDown',
  quit = 'quit',
  toggleConsole = 'toggleConsole',
  halfPageUp = 'halfPageUp',
  halfPageDown = 'halfPageDown',
  pageDown = 'pageDown',
  pageUp = 'pageUp',
  enter = 'enter',
  delete = 'delete',
  deleteBookmark = 'deleteBookmark',
  yPressed = 'yPressed',
  nPressed = 'nPressed',
  escPressed = 'escPressed',
  help = 'help',
}
export type TKeymap = ReturnType<typeof createOpenTuiKeymap>;

const keyBindings: Array<{ key: string; event: KeymapEvents }> = [
  { key: 'up', event: KeymapEvents.moveUp },
  { key: 'down', event: KeymapEvents.moveDown },
  { key: 'ctrl+q', event: KeymapEvents.quit },
  { key: 'alt+c', event: KeymapEvents.toggleConsole },
  { key: 'alt+d', event: KeymapEvents.deleteBookmark },
  { key: 'ctrl+u', event: KeymapEvents.halfPageUp },
  { key: 'ctrl+d', event: KeymapEvents.halfPageDown },
  { key: 'ctrl+b', event: KeymapEvents.pageUp },
  { key: 'ctrl+f', event: KeymapEvents.pageDown },
  { key: 'ctrl+h', event: KeymapEvents.help },
  { key: 'end', event: KeymapEvents.halfPageDown },
  { key: 'return', event: KeymapEvents.enter },
  { key: 'y', event: KeymapEvents.yPressed },
  { key: 'n', event: KeymapEvents.nPressed },
  { key: 'escape', event: KeymapEvents.quit },
];

export class Keymap extends EventEmitter {
  static _instance: Keymap;

  static init(renderer: CliRenderer): Keymap {
    if (!Keymap._instance) {
      Keymap._instance = new Keymap(renderer);
    }
    return Keymap._instance;
  }

  private constructor(renderer: CliRenderer) {
    super();
    const keymap = createOpenTuiKeymap(renderer);
    registerDefaultKeys(keymap);
    const commands = [];
    const bindings = [];
    let i = 0;
    for (const b of keyBindings) {
      const cmd = `command_${i++}`;
      const { key, event } = b;
      bindings.push({ key, cmd });
      commands.push({ name: cmd, run: () => this.emit.bind(this)(event) });
    }
    keymap.registerLayer({ commands, bindings });
  }

  static get instance(): Keymap {
    if (!Keymap._instance) {
      throw new Error('Keymap not initialized!');
    }
    return Keymap._instance;
  }
}
