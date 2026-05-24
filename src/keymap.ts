import type { CliRenderer } from "@opentui/core";
import { createOpenTuiKeymap } from "@opentui/keymap/opentui";
import { registerDefaultKeys } from "@opentui/keymap/addons";
import { EventBus, KeymapEvents } from "./events";

export type TKeymap = ReturnType<typeof createOpenTuiKeymap>;

const keyBindings: Array<{ key: string; event: KeymapEvents }> = [
  { key: "up", event: KeymapEvents.moveUp },
  { key: "down", event: KeymapEvents.moveDown },
  { key: "ctrl+q", event: KeymapEvents.quit },
  { key: "alt+c", event: KeymapEvents.toggleConsole },
  { key: "ctrl+u", event: KeymapEvents.halfPageUp },
  { key: "ctrl+d", event: KeymapEvents.halfPageDown },
  { key: "ctrl+b", event: KeymapEvents.pageUp },
  { key: "ctrl+f", event: KeymapEvents.pageDown },
  { key: "end", event: KeymapEvents.halfPageDown },
  { key: "return", event: KeymapEvents.enter },
];

export const createKeymap = (renderer: CliRenderer): TKeymap => {
  const keymap = createOpenTuiKeymap(renderer);
  registerDefaultKeys(keymap);
  const commands = [];
  const bindings = [];
  let i = 0;
  for (const b of keyBindings) {
    const cmd = `command_${i++}`;
    const { key, event } = b;
    bindings.push({ key, cmd });
    commands.push({ name: cmd, run: () => EventBus.emit(event) });
  }
  keymap.registerLayer({ commands, bindings });
  return keymap;
};
