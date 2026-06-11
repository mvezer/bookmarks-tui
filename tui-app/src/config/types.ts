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
  colorSchemes: Record<string, ColorScheme>;
}

export interface UserConfig {
  general?: Partial<GeneralConfig>;
  keymap?: KeymapDefinition[];
  colorSchemes?: Record<string, ColorScheme>;
}
