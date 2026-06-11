import { YAML, TOML } from 'bun';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import type { Config } from '../types';
import type { ColorScheme } from '../../colorscheme';
import { parseColorScheme, DEFAULT_COLORSCHEME } from './colorscheme-parser.ts';
import { parseKeymapDefinitions } from './keymap-parser.ts';
import type { MainOptions } from '../../cli-controller';
import { getDefaultBrowserCommand } from '../../utils/browser.ts';

const DEFAULT_FILE_NAME = 'bookmarks-tui';
const DEFAULT_CONFIG_DIRECTORY = `${process.env.HOME}/.config/bookmarks-tui`;

export enum ALLOWED_FORMATS {
  'TOML' = 'toml',
  'YAML' = 'yaml',
  'JSON' = 'json',
}
const EXTENSIONS_MAP: Record<ALLOWED_FORMATS, string[]> = {
  [ALLOWED_FORMATS.TOML]: ['toml'],
  [ALLOWED_FORMATS.YAML]: ['yaml', 'yml'],
  [ALLOWED_FORMATS.JSON]: ['json'],
};

const DEFAULT_CONFIG: Config = {
  general: {
    transparentBackground: false,
    browserCommand: getDefaultBrowserCommand(),
    disableHttpServer: false,
    colorScheme: 'default',
    editor: 'nano',
  },
  keymap: [],
  customColorSchemes: {
    default: parseColorScheme(DEFAULT_COLORSCHEME, false).colorScheme!,
  },
};

const detectFilePathAndFormat = (): {
  filePath: string | undefined;
  format: ALLOWED_FORMATS | undefined;
} => {
  for (const [format, extensions] of Object.entries(EXTENSIONS_MAP)) {
    for (const extension of extensions) {
      const filePath = path.join(
        DEFAULT_CONFIG_DIRECTORY,
        `${DEFAULT_FILE_NAME}.${extension}`,
      );
      if (existsSync(filePath)) {
        return { filePath, format: format as ALLOWED_FORMATS };
      }
    }
  }
  return { filePath: undefined, format: undefined };
};

const inferConfigFormat = (filePath: string): ALLOWED_FORMATS | undefined => {
  const extension = path.extname(filePath);
  if (!extension) {
    return;
  }
  for (const [format, extensions] of Object.entries(EXTENSIONS_MAP)) {
    if (extensions.includes(extension)) {
      return format as ALLOWED_FORMATS;
    }
  }
};

export const parseConfigFileOrDefault = (
  mainOptions?: MainOptions,
): { config: Config; errors: string[] } => {
  let format: ALLOWED_FORMATS | undefined;
  let filePath: string | undefined = mainOptions?.configPath;
  if (!filePath) {
    ({ filePath, format } = detectFilePathAndFormat());
  } else {
    format = inferConfigFormat(filePath);
    if (!format) {
      return {
        config: {} as Config,
        errors: [`Could not detect config format from file: ${filePath}`],
      };
    }
  }
  const parsedConfig: Config = {
    general: {},
    customColorSchemes: {},
  } as Config;
  let configObj: any = {};
  const errors: string[] = [];
  if (filePath && format) {
    const fileContent = readFileSync(filePath, 'utf8');

    try {
      switch (format) {
        case ALLOWED_FORMATS.TOML:
          configObj = TOML.parse(fileContent);
          break;
        case ALLOWED_FORMATS.YAML:
          configObj = YAML.parse(fileContent);
          break;
        case ALLOWED_FORMATS.JSON:
          configObj = JSON.parse(fileContent);
          break;
      }
    } catch (e) {
      errors.push(`Error parsing config file: ${e}`);
      return { config: {} as Config, errors };
    }

    const invalidKeys = Object.keys(configObj).filter(
      (key) => !['general', 'customColorSchemes', 'keymap'].includes(key),
    );
    if (invalidKeys.length > 0) {
      errors.push(`Invalid config key(s): ${invalidKeys.join(', ')}`);
      return { config: {} as Config, errors };
    }
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

  const { keymap, errors: keymapErrors } = parseKeymapDefinitions(
    configObj.keymap || [],
  );
  parsedConfig.keymap = keymap;
  errors.push(...keymapErrors);
  return {
    config: errors.length === 0 ? parsedConfig : ({} as Config),
    errors,
  };
};
