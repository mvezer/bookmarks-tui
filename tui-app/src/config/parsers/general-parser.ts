import type { Config } from '../types';
import { getDefaultBrowserCommand } from '../../utils/browser';

export const DEFAULT_GENERAL_CONFIG: Config['general'] = {
  transparentBackground: false,
  browserCommand: getDefaultBrowserCommand(),
  disableHttpServer: false,
  colorScheme: 'ayu_dark',
  editor: 'nano',
};
export const parseGeneralConfig = (
  configObj: Record<string, unknown> | undefined,
): Partial<Config['general']> | undefined => {
  if (!configObj?.general) {
    return undefined;
  }
  const invalidKeys = Object.keys(configObj.general).filter(
    (key) => !Object.keys(DEFAULT_GENERAL_CONFIG).includes(key),
  );
  if (invalidKeys.length > 0) {
    throw new Error(`Invalid general config key(s): ${invalidKeys.join(', ')}`);
  }
  return configObj.general as Partial<Config['general']>;
};
