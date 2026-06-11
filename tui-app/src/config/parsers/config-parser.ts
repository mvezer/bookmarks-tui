import type { Config } from '../types';
import type { ColorScheme } from '../../colorscheme';
import { parseColorScheme } from './colorscheme-parser.ts';
import { DEFAULT_COLORSCHEME_DEFINITIONS } from '../../colorscheme/default-colorschemes';
import { parseKeymapConfig } from './keymap-parser.ts';
import type { MainOptions } from '../../cli-controller';
import { getDefaultBrowserCommand } from '../../utils/browser.ts';
import type { KeymapDefinition } from '../../tui/keymap';
import { parseGeneralConfig } from './parsers/general-parser';


const DEFAULT_CONFIG: Config = {
  general: {
    transparentBackground: false,
    browserCommand: getDefaultBrowserCommand(),
    disableHttpServer: false,
    colorScheme: 'default',
    editor: 'nano',
  },
  keymap: [],
  colorSchemes: Object.entries(DEFAULT_COLORSCHEME_DEFINITIONS).reduce(
    (acc, [colorSchemeName, colorSchemeDefinition]) => {
      acc[colorSchemeName] = parseColorScheme(
        colorSchemeDefinition,
        false,
      ).colorScheme!;
      return acc;
    },
    {} as Record<string, ColorScheme>,
  ),
};



export const parseConfigFileOrDefault = (
  mainOptions?: MainOptions,
): { config: Config; errors: string[] } => {

    if (configObj.general) {
      const invalidGeneralKeys = Object.keys(configObj.general).filter(
        (key) => !Object.keys(configObj.general).includes(key),
      );
      if (invalidGeneralKeys.length > 0) {
        errors.push(
          `Invalid general config keys: ${invalidGeneralKeys.join(', ')}`,
        );
        return { config: {} as Config, errors };
      }
    }
  }

  parsedConfig.general = {
    ...DEFAULT_CONFIG.general,
    ...{ editor: process.env['EDITOR'] || DEFAULT_CONFIG.general.editor },
    ...(configObj.general || {}),
  };

  parsedConfig.general.transparentBackground =
    mainOptions?.transparent ||
    parsedConfig.general.transparentBackground ||
    DEFAULT_CONFIG.general.transparentBackground;

  parsedConfig.general.disableHttpServer =
    mainOptions?.disableHttpServer ||
    parsedConfig.general.disableHttpServer ||
    DEFAULT_CONFIG.general.disableHttpServer;

  parsedConfig.general.editor =
    mainOptions?.editor ||
    parsedConfig.general.editor ||
    DEFAULT_CONFIG.general.editor;

  parsedConfig.general.browserCommand =
    mainOptions?.browserCommand ||
    parsedConfig.general.browserCommand ||
    DEFAULT_CONFIG.general.browserCommand;

  const parsedColorSchemes = Object.keys(
    configObj.customColorSchemes || {},
  ).reduce(
    (acc, key) => {
      const { colorScheme, errors: colorError } = parseColorScheme(
        configObj.customColorSchemes[key],
        parsedConfig.general.transparentBackground,
      );
      if (colorScheme === undefined || colorError.length > 0) {
        errors.push(
          `Invalid color scheme:  "${key}" (${colorError ? colorError.join(' ') : ''})`,
        );
        return acc;
      }
      acc[key] = colorScheme;
      return acc;
    },
    {} as Record<string, ColorScheme>,
  );

  parsedConfig.customColorSchemes = {
    ...DEFAULT_CONFIG.customColorSchemes,
    ...(parsedColorSchemes || {}),
  };
  parsedConfig.general.colorScheme =
    mainOptions?.colorScheme ||
    parsedConfig.general.colorScheme ||
    DEFAULT_CONFIG.general.colorScheme;
  const availableColorSchemes = Object.keys(parsedConfig.customColorSchemes);
  if (!availableColorSchemes.includes(parsedConfig.general.colorScheme)) {
    errors.push(
      `Invalid color scheme: ${parsedConfig.general.colorScheme} (available: ${availableColorSchemes.join(', ')})`,
    );
  }

  const { keymap, errors: keymapErrors } = parseKeymapConfig(
    configObj.keymap || [],
  );
  parsedConfig.keymap = keymap;
  errors.push(...keymapErrors);
  return {
    config: errors.length === 0 ? parsedConfig : ({} as Config),
    errors,
  };
};
