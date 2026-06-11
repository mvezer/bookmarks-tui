import { type ColorScheme } from '../colorscheme';
import { type KeymapDefinition } from '../tui/keymap';

export interface GeneralConfig {
  transparentBackground: boolean;
  browserCommand?: string;
  disableHttpServer: boolean;
  colorScheme: string;
  editor?: string;
}

export interface Config {
  general: GeneralConfig;
  keymap: KeymapDefinition[];
  customColorSchemes: Record<string, ColorScheme>;
}
