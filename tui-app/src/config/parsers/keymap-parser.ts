import { type KeymapDefinition, KeymapEvents } from '../../tui/keymap';

const DEFAULT_KEYMAP_DEFINITIONS: KeymapDefinition[] = [
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

const ALLOWED_KEYMAP_ACTIONS: Set<string> = new Set(
  DEFAULT_KEYMAP_DEFINITIONS.map((b) => b.event),
);

const isValidKeymapAction = (action: string): boolean => {
  return ALLOWED_KEYMAP_ACTIONS.has(action);
};

const isValidKey = (key: string): boolean => {
  // TODO: figure out a way to actually validate the key
  return key.length > 0;
};

const definitionExists = (
  existingKeymapDefinitions: KeymapDefinition[],
  keymapDefintion: KeymapDefinition,
): boolean => {
  if (existingKeymapDefinitions.length === 0) {
    return false;
  }
  const keyMatches = existingKeymapDefinitions.filter((k) => {
    return keymapDefintion.key === k.key;
  });
  // no key matches -> no existing keymap defintion
  if (keyMatches.length === 0) {
    return false;
  }
  // more has key matches -> surely a duplicate
  if (keyMatches.length > 1) {
    return true;
  }

  // here we have a single key match
  const keyMatch = keyMatches[0]!;

  // if the key and event match, it's a duplicate
  if (keyMatch.event === keymapDefintion.event) {
    return true;
  }
  if (
    keyMatch.event.startsWith('dialog') &&
    keymapDefintion.event.startsWith('dialog')
  ) {
    return true;
  }
  if (
    !keyMatch.event.startsWith('dialog') &&
    !keymapDefintion.event.startsWith('dialog')
  ) {
    return true;
  }
  return false;
};

export const parseKeymapDefinitions = (
  keymapArr: { key: string; action: string }[],
): { keymap: KeymapDefinition[]; errors: string[] } => {
  const errors: string[] = [];
  const invalidActions = keymapArr.filter(
    ({ action }) => !isValidKeymapAction(action),
  );
  if (invalidActions.length > 0) {
    errors.push(
      `Invalid keymap action(s): ${invalidActions.map(({ action }) => action).join(', ')}, (must be one of: ${Array.from(ALLOWED_KEYMAP_ACTIONS).join(', ')})`,
    );
  }
  const invalidKeys = keymapArr.filter(({ key }) => !isValidKey(key));
  if (invalidKeys.length > 0) {
    errors.push(
      `Invalid keymap key(s): ${invalidKeys.map(({ key }) => key).join(', ')}`,
    );
  }

  if (errors.length > 0) {
    return { keymap: [], errors };
  }

  let keymapDefintions = keymapArr.map(({ key, action }) => ({
    key,
    event: action as KeymapEvents,
  }));

  // fill up the definitions with the default ones
  keymapDefintions = [
    ...keymapDefintions,
    ...DEFAULT_KEYMAP_DEFINITIONS.filter(
      (defininiton) => !definitionExists(keymapDefintions, defininiton),
    ),
  ];

  return {
    keymap: keymapDefintions,
    errors: [],
  };
};
