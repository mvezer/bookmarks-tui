import { parseColor } from '@opentui/core';
import type { ColorScheme } from './types';

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
};

const ALPHA_VALUES: Record<
  'transparent' | 'opaque',
  Record<keyof ColorScheme, number>
> = {
  transparent: {
    background: 0,
    foreground: 1.0,
    border: 1.0,
    searchBackground: 0,
    searchForeground: 1.0,
    searchBorder: 1.0,
    statusBackground: 0,
    statusForeground: 1.0,
    statusBorder: 1.0,
    selectedBackground: 0.6,
    selectedForeground: 1.0,
    deleteDialogBackground: 1.0,
    deleteDialogForeground: 1.0,
    deleteDialogBorder: 1.0,
  },
  opaque: {
    background: 1.0,
    foreground: 1.0,
    border: 1.0,
    searchBackground: 1.0,
    searchForeground: 1.0,
    searchBorder: 1.0,
    statusBackground: 1.0,
    statusForeground: 1.0,
    statusBorder: 1.0,
    selectedBackground: 1.0,
    selectedForeground: 1.0,
    deleteDialogBackground: 1.0,
    deleteDialogForeground: 1.0,
    deleteDialogBorder: 1.0,
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
