import { type MainOptions } from '../cli-controller';
import { getDefaultBrowserCommand } from '../utils/browser';
import { loadConfigFile } from './config-file-loader';
import {
  parseGeneralConfig,
  DEFAULT_GENERAL_CONFIG,
} from './parsers/general-parser';
import { parseKeymapConfig } from './parsers/keymap-parser';
import { parseColorSchemeConfig } from './parsers/colorscheme-parser';
import type { Config } from './types';
const ALLOWED_CONFIG_KEYS = ['general', 'colorSchemes', 'keymap'];

const getInvalidKeys = (config: Record<string, unknown>): string[] => {
  return Object.keys(config).filter(
    (key) => !ALLOWED_CONFIG_KEYS.includes(key),
  );
};

export const getConfig = (mainOptions: MainOptions | undefined): Config => {
  const configObj = loadConfigFile(mainOptions?.configPath);
  if (configObj) {
    const invalidKeys = getInvalidKeys(configObj);
    if (invalidKeys.length > 0) {
      throw new Error(`Invalid config key(s): ${invalidKeys.join(', ')}`);
    }
  }

  const userGeneralConfig = parseGeneralConfig(configObj) || {};
  const general: Config['general'] = {
    transparentBackground:
      !!mainOptions?.transparent ||
      !!userGeneralConfig.transparentBackground ||
      DEFAULT_GENERAL_CONFIG.transparentBackground,
    browserCommand:
      mainOptions?.browserCommand ||
      userGeneralConfig.browserCommand ||
      getDefaultBrowserCommand(),
    disableHttpServer:
      !!mainOptions?.disableHttpServer ||
      !!userGeneralConfig.disableHttpServer ||
      DEFAULT_GENERAL_CONFIG.disableHttpServer,
    colorScheme:
      mainOptions?.colorScheme ||
      userGeneralConfig.colorScheme ||
      DEFAULT_GENERAL_CONFIG.colorScheme,
    editor:
      mainOptions?.editor ||
      userGeneralConfig.editor ||
      process.env.EDITOR ||
      DEFAULT_GENERAL_CONFIG.editor,
  };
  const keymap: Config['keymap'] = parseKeymapConfig(configObj) || [];
  const colorSchemes: Config['colorSchemes'] = parseColorSchemeConfig(
    configObj,
    general.transparentBackground,
  );
  const availableColorSchemes = Object.keys(colorSchemes);
  if (!availableColorSchemes.includes(general.colorScheme)) {
    throw new Error(
      `Invalid color scheme: "${general.colorScheme}" (available color schemes: ${availableColorSchemes.join(', ')})`,
    );
  }
  return {
    general,
    keymap,
    colorSchemes,
  };
};
