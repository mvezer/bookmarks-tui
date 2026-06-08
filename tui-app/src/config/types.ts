import { type ColorScheme } from '../colorscheme';
import { type KeymapDefinition } from '../keymap/keymap';

export interface GeneralConfig {
  transparentBackground: boolean;
  urlOpenScript: string;
  disableHttpServer: boolean;
  colorScheme: string;
}

export interface Config {
  general: GeneralConfig;
  keymap: KeymapDefinition[];
  customColorSchemes: Record<string, ColorScheme>;
}
