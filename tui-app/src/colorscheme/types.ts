import { RGBA } from '@opentui/core';
export enum ColorSchemesKeys {
  Background = 'background',
  Foreground = 'foreground',
  Border = 'border',
  SearchBackground = 'searchBackground',
  SearchForeground = 'searchForeground',
  SearchBorder = 'searchBorder',
  StatusBackground = 'statusBackground',
  StatusForeground = 'statusForeground',
  StatusBorder = 'statusBorder',
  SelectedBackground = 'selectedBackground',
  SelectedForeground = 'selectedForeground',
  DeleteDialogBackground = 'deleteDialogBackground',
  DeleteDialogForeground = 'deleteDialogForeground',
  DeleteDialogBorder = 'deleteDialogBorder',
  DialogBackground = 'dialogBackground',
  DialogForeground = 'dialogForeground',
  DialogBorder = 'dialogBorder',
  ErrorToastBackground = 'errorToastBackground',
  ErrorToastForeground = 'errorToastForeground',
  ErrorToastBorder = 'errorToastBorder',
  InfoToastBackground = 'infoToastBackground',
  InfoToastForeground = 'infoToastForeground',
  InfoToastBorder = 'infoToastBorder',
}
export type ColorSchemesDefinition = Record<ColorSchemesKeys, string>;
export type ColorScheme = Record<ColorSchemesKeys, RGBA>;
