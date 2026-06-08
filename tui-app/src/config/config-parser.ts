import { YAML, TOML } from 'bun';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import type { Config } from './types';
import {
  type ColorScheme,
  parseColorScheme,
  DEFAULT_COLORSCHEME,
} from '../colorscheme';

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
    urlOpenScript: 'default',
    disableHttpServer: false,
    colorScheme: 'default',
  },
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
  filePath?: string,
): { config: Config | undefined; errors: string[] } => {
  let format: ALLOWED_FORMATS | undefined;
  if (!filePath) {
    ({ filePath, format } = detectFilePathAndFormat());
  } else {
    format = inferConfigFormat(filePath);
    if (!format) {
      return {
        config: undefined,
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
    console.log(`Using config file: ${filePath} (${format})`);
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
      return { config: undefined, errors };
    }

    const invalidKeys = Object.keys(configObj).filter(
      (key) => !['general', 'customColorSchemes'].includes(key),
    );
    if (invalidKeys.length > 0) {
      errors.push(`Invalid config key(s): ${invalidKeys.join(', ')}`);
      return { config: undefined, errors };
    }
    if (configObj.general) {
      const invalidGeneralKeys = Object.keys(configObj.general).filter(
        (key) => !Object.keys(configObj.general).includes(key),
      );
      if (invalidGeneralKeys.length > 0) {
        errors.push(
          `Invalid general config keys: ${invalidGeneralKeys.join(', ')}`,
        );
        return { config: undefined, errors };
      }
    }
  }

  parsedConfig.general = {
    ...DEFAULT_CONFIG.general,
    ...(configObj.general || {}),
  };

  const parsedColorShemes = Object.keys(
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
    ...(parsedColorShemes || {}),
  };
  return { config: errors.length === 0 ? parsedConfig : undefined, errors };
};
