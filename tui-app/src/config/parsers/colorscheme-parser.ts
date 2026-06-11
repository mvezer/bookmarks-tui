import { parseColor } from '@opentui/core';
import {
  type ColorScheme,
  ColorSchemesKeys,
  type ColorSchemesDefinition,
} from '../../colorscheme';
import { ALPHA_MAP } from '../../colorscheme/alpha-map';
import type { Config } from '../types';
import {
  DEFAULT_COLORSCHEME_DEFINITION,
  DEFAULT_COLORSCHEME_DEFINITIONS,
} from '../../colorscheme/default-colorschemes';

export const parseColorSchemeConfig = (
  config: Record<string, unknown> | undefined,
  transparentBackground: boolean,
): Config['colorSchemes'] => {
  const colorSchemes: Config['colorSchemes'] = {};
  const defaultColorScheme = parseColorScheme(
    DEFAULT_COLORSCHEME_DEFINITION,
    transparentBackground,
  );
  for (const [key, value] of Object.entries({
    ...(config?.colorSchemes as Record<string, ColorSchemesDefinition>),
    ...DEFAULT_COLORSCHEME_DEFINITIONS,
  })) {
    colorSchemes[key as keyof Config['colorSchemes']] = {
      ...defaultColorScheme,
      ...(parseColorScheme(value, transparentBackground) as ColorScheme),
    };
  }
  return colorSchemes;
};
export const parseColorScheme = (
  colorSchemeDefinition: ColorSchemesDefinition,
  transparentBackground: boolean,
): Partial<ColorScheme> => {
  const errors: string[] = [];
  const colorScheme: ColorScheme | undefined = {} as ColorScheme;
  const invalidKeys = Object.keys(colorSchemeDefinition).filter(
    (key) => !Object.values(ColorSchemesKeys).includes(key as ColorSchemesKeys),
  );
  if (invalidKeys.length > 0) {
    throw new Error(
      `Invalid key(s): ${invalidKeys.join(', ')} (allowed keys: ${Object.values(ColorSchemesKeys).join(', ')})`,
    );
  }
  for (const key of Object.values(ColorSchemesKeys)) {
    let color = parseColor(DEFAULT_COLORSCHEME_DEFINITION[key]);
    if (colorSchemeDefinition[key] !== undefined) {
      try {
        color = parseColor(colorSchemeDefinition[key]);
      } catch (e) {
        errors.push(
          `Invalid color (${colorSchemeDefinition[key]}) for key "${key}"`,
        );
        continue;
      }
    }
    color.a =
      ALPHA_MAP[transparentBackground ? 'transparent' : 'opaque'][
        key as keyof ColorScheme
      ]!;
    colorScheme[key as keyof ColorScheme] = color;
  }

  return colorScheme;
};
