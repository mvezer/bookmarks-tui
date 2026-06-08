import { type ColorScheme } from '../colorscheme';

export interface GeneralConfig {
  transparentBackground: boolean;
  urlOpenScript: string;
  disableHttpServer: boolean;
  colorScheme: string;
}

export interface Config {
  general: GeneralConfig;
  customColorSchemes: Record<string, ColorScheme>;
}
