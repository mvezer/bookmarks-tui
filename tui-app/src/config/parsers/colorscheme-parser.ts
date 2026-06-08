import { parseColor } from '@opentui/core';
import type { ColorScheme } from '../../colorscheme';

export const DEFAULT_COLORSCHEME: Record<keyof ColorScheme, string> = {
  background: '#000000',
  foreground: '#bdbdbd',
  border: '#bdbdbd',
  searchBackground: '#ffffff',
  searchForeground: '#000000',
  searchBorder: '#ffffff',
  statusBackground: '#000000',
  statusForeground: '#ffffff',
  statusBorder: '#ffffff',
  selectedBackground: '#6c6c6c',
  selectedForeground: '#00d4c0',
  deleteDialogBackground: '#000000',
  deleteDialogForeground: '#ffffff',
  deleteDialogBorder: '#ffffff',
  dialogBackground: '#000000',
  dialogForeground: '#bdbdbd',
  dialogBorder: '#bdbdbd',
};

const ALPHA_VALUES: Record<
  'transparent' | 'opaque',
  Record<keyof ColorScheme, number>
> = {
  transparent: {
    background: 0,
    foreground: 0xff,
    border: 0xff,
    searchBackground: 0,
    searchForeground: 0xff,
    searchBorder: 0xff,
    statusBackground: 0,
    statusForeground: 0xff,
    statusBorder: 0xff,
    selectedBackground: 0x80,
    selectedForeground: 0xff,
    deleteDialogBackground: 0xff,
    deleteDialogForeground: 0xff,
    deleteDialogBorder: 0xff,
    dialogBackground: 0x80,
    dialogForeground: 0x80,
    dialogBorder: 0x80,
  },
  opaque: {
    background: 0xff,
    foreground: 0xff,
    border: 0xff,
    searchBackground: 0xff,
    searchForeground: 0xff,
    searchBorder: 0xff,
    statusBackground: 0xff,
    statusForeground: 0xff,
    statusBorder: 0xff,
    selectedBackground: 0xff,
    selectedForeground: 0xff,
    deleteDialogBackground: 0xff,
    deleteDialogForeground: 0xff,
    deleteDialogBorder: 0xff,
    dialogBackground: 0xff,
    dialogForeground: 0xff,
    dialogBorder: 0xff,
  },
};

export const parseColorScheme = (
  schemeObj: Record<string, string>,
  transparentBackground: boolean,
): { colorScheme: ColorScheme | undefined; errors: string[] } => {
  const allowedKeys = Object.keys(DEFAULT_COLORSCHEME) as Array<
    keyof ColorScheme
  >;

  const errors: string[] = [];
  const colorScheme: ColorScheme | undefined = {} as ColorScheme;
  const invalidKeys = Object.keys(schemeObj).filter(
    (key) => !allowedKeys.includes(key as keyof ColorScheme),
  );
  if (invalidKeys.length > 0) {
    errors.push(`Invalid keys: ${invalidKeys.join(', ')}`);
    return { colorScheme: undefined, errors };
  }
  for (const key of allowedKeys) {
    let color = parseColor(DEFAULT_COLORSCHEME[key]);
    if (schemeObj[key] !== undefined) {
      try {
        color = parseColor(schemeObj[key]);
      } catch (e) {
        errors.push(`Invalid color (${schemeObj[key]}) for key "${key}"`);
        continue;
      }
    }
    color.a =
      ALPHA_VALUES[transparentBackground ? 'transparent' : 'opaque'][
        key as keyof ColorScheme
      ];
    colorScheme[key as keyof Partial<ColorScheme>] = color;
  }

  return { colorScheme: errors.length === 0 ? colorScheme : undefined, errors };
};
