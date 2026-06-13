import path from 'path';
import { YAML, TOML } from 'bun';
import { existsSync, readFileSync } from 'fs';

const DEFAULT_FILE_NAME = 'bookmarks-tui';

// locactions will be checked in this order
const CONFIG_FILE_LOCATIONS = [
  `${process.env.HOME || '~'}/.config/bookmarks-tui`,
  `${process.env.HOME || '~'}`,
];

export enum ALLOWED_CONFIG_FORMATS {
  'TOML' = 'toml',
  'YAML' = 'yaml',
  'JSON' = 'json',
}

// all this because of yaml/yml...
const EXTENSIONS_MAP: Record<ALLOWED_CONFIG_FORMATS, string[]> = {
  [ALLOWED_CONFIG_FORMATS.TOML]: ['toml'],
  [ALLOWED_CONFIG_FORMATS.YAML]: ['yaml', 'yml'],
  [ALLOWED_CONFIG_FORMATS.JSON]: ['json'],
};

const inferConfigFormatFromFilePath = (
  filePath: string,
): ALLOWED_CONFIG_FORMATS | undefined => {
  const extension = path.extname(filePath)?.replace('.', '');
  if (!extension) {
    return;
  }

  for (const [format, extensions] of Object.entries(EXTENSIONS_MAP)) {
    if (extensions.includes(extension)) {
      return format as ALLOWED_CONFIG_FORMATS;
    }
  }
};

const detectFilePathAndFormat = (): {
  configPath: string | undefined;
  format: ALLOWED_CONFIG_FORMATS | undefined;
} => {
  for (const configFileLocation of CONFIG_FILE_LOCATIONS) {
    for (const [format, extensions] of Object.entries(EXTENSIONS_MAP)) {
      for (const extension of extensions) {
        const configPath = path.join(
          configFileLocation,
          `${DEFAULT_FILE_NAME}.${extension}`,
        );
        if (existsSync(configPath)) {
          return { configPath, format: format as ALLOWED_CONFIG_FORMATS };
        }
      }
    }
  }
  return { configPath: undefined, format: undefined };
};

export const loadConfigFile = (
  configPath?: string,
): Record<string, unknown> => {
  let format: ALLOWED_CONFIG_FORMATS | undefined;
  if (!configPath) {
    ({ configPath, format } = detectFilePathAndFormat());
  } else {
    format = inferConfigFormatFromFilePath(configPath);
    if (!format) {
      throw new Error(`Could not detect config format of file: ${configPath}`);
    }
  }
  let config = {};
  if (configPath && format) {
    const fileContent = readFileSync(configPath, 'utf8');

    try {
      switch (format) {
        case ALLOWED_CONFIG_FORMATS.TOML:
          config = TOML.parse(fileContent);
          break;
        case ALLOWED_CONFIG_FORMATS.YAML:
          config = YAML.parse(fileContent) as Record<string, unknown>;
          break;
        case ALLOWED_CONFIG_FORMATS.JSON:
          config = JSON.parse(fileContent);
          break;
      }
    } catch (e) {
      throw new Error(`Error parsing config file: ${e}`);
    }
  }
  return config;
};
