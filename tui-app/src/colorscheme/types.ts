import { RGBA } from '@opentui/core';

export interface ColorScheme {
  background: RGBA;
  foreground: RGBA;
  border: RGBA;
  searchBackground: RGBA;
  searchForeground: RGBA;
  searchBorder: RGBA;
  statusBackground: RGBA;
  statusForeground: RGBA;
  statusBorder: RGBA;
  selectedBackground: RGBA;
  selectedForeground: RGBA;
  deleteDialogBackground: RGBA;
  deleteDialogForeground: RGBA;
  deleteDialogBorder: RGBA;
}

export interface ColorSchemeError {
  line: number;
  column: number;
  message: string;
}
