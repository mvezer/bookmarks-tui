import type { ColorSchemesDefinition } from './types';

export const DEFAULT_COLORSCHEME_NAME: string = 'ayu_dark';

export const DEFAULT_COLORSCHEME_DEFINITIONS: Record<
  string,
  ColorSchemesDefinition
> = {
  // ayu_dark
  default: {
    background: '#0A0E14',
    foreground: '#B3B1AD',
    border: '#C7C7C7', // normal white
    searchBackground: '#0A0E14', // normal white
    searchForeground: '#C2D94C', // bright green
    searchBorder: '#C7C7C7', // normal white
    statusBackground: '#0A0E14',
    statusForeground: '#59C2FF', // bright blue
    statusBorder: '#C7C7C7',
    selectedBackground: '#F9AF4F', // yellow
    selectedForeground: '#01060E', // black
    deleteDialogBackground: '#EA6C73',
    deleteDialogForeground: '#01060E',
    deleteDialogBorder: '#01060E', // bright red
    dialogBackground: '#0A0E14',
    dialogForeground: '#B3B1AD',
    dialogBorder: '#C7C7C7',
    errorToastBackground: '#F07178',
    errorToastForeground: '#01060E', // bright red
    errorToastBorder: '#01060E', // bright red
    infoToastBackground: '#0A0E14',
    infoToastForeground: '#90E1C6', // normal cyan
    infoToastBorder: '#90E1C6', // normal cyan
  },
  // Catppuccin Frappé
  catppuccin_frappe: {
    background: '#303446', // base
    foreground: '#C6D0F5', // text
    border: '#A5ADCE', // subtext0
    searchBackground: '#A5ADCE', // subtext0
    searchForeground: '#303446', // base
    searchBorder: '#A5ADCE', // subtext0
    statusBackground: '#303446', // base
    statusForeground: '#C6D0F5', // text
    statusBorder: '#A5ADCE', // subtext0
    selectedBackground: '#626880', // surface2
    selectedForeground: '#81C8BE', // teal
    deleteDialogBackground: '#303446', // base
    deleteDialogForeground: '#C6D0F5', // text
    deleteDialogBorder: '#E78284', // red
    dialogBackground: '#303446', // base
    dialogForeground: '#C6D0F5', // text
    dialogBorder: '#A5ADCE', // subtext0
    errorToastBackground: '#303446', // base
    errorToastForeground: '#E78284', // red
    errorToastBorder: '#E78284', // red
    infoToastBackground: '#303446', // base
    infoToastForeground: '#81C8BE', // teal
    infoToastBorder: '#81C8BE', // teal
  },

  // Catppuccin Mocha
  catppuccin_mocha: {
    background: '#1E1E2E', // base
    foreground: '#CDD6F4', // text
    border: '#A6ADC8', // subtext0
    searchBackground: '#A6ADC8', // subtext0
    searchForeground: '#1E1E2E', // base
    searchBorder: '#A6ADC8', // subtext0
    statusBackground: '#1E1E2E', // base
    statusForeground: '#CDD6F4', // text
    statusBorder: '#A6ADC8', // subtext0
    selectedBackground: '#585B70', // surface2
    selectedForeground: '#94E2D5', // teal
    deleteDialogBackground: '#1E1E2E', // base
    deleteDialogForeground: '#CDD6F4', // text
    deleteDialogBorder: '#F38BA8', // red
    dialogBackground: '#1E1E2E', // base
    dialogForeground: '#CDD6F4', // text
    dialogBorder: '#A6ADC8', // subtext0
    errorToastBackground: '#1E1E2E', // base
    errorToastForeground: '#F38BA8', // red
    errorToastBorder: '#F38BA8', // red
    infoToastBackground: '#1E1E2E', // base
    infoToastForeground: '#94E2D5', // teal
    infoToastBorder: '#94E2D5', // teal
  },

  // Catppuccin Macchiato
  catppuccin_macchiato: {
    background: '#24273A', // base
    foreground: '#CAD3F5', // text
    border: '#A5ADCB', // subtext0
    searchBackground: '#A5ADCB', // subtext0
    searchForeground: '#24273A', // base
    searchBorder: '#A5ADCB', // subtext0
    statusBackground: '#24273A', // base
    statusForeground: '#CAD3F5', // text
    statusBorder: '#A5ADCB', // subtext0
    selectedBackground: '#5B6078', // surface2
    selectedForeground: '#8BD5CA', // teal
    deleteDialogBackground: '#24273A', // base
    deleteDialogForeground: '#CAD3F5', // text
    deleteDialogBorder: '#ED8796', // red
    dialogBackground: '#24273A', // base
    dialogForeground: '#CAD3F5', // text
    dialogBorder: '#A5ADCB', // subtext0
    errorToastBackground: '#24273A', // base
    errorToastForeground: '#ED8796', // red
    errorToastBorder: '#ED8796', // red
    infoToastBackground: '#24273A', // base
    infoToastForeground: '#8BD5CA', // teal
    infoToastBorder: '#8BD5CA', // teal
  },

  // Dracula
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    border: '#bbbbbb',
    searchBackground: '#ffffff',
    searchForeground: '#282a36',
    searchBorder: '#ffffff',
    statusBackground: '#282a36',
    statusForeground: '#f8f8f2',
    statusBorder: '#bbbbbb',
    selectedBackground: '#555555', // bright black
    selectedForeground: '#8be9fd', // cyan
    deleteDialogBackground: '#282a36',
    deleteDialogForeground: '#f8f8f2',
    deleteDialogBorder: '#ff5555', // red
    dialogBackground: '#282a36',
    dialogForeground: '#f8f8f2',
    dialogBorder: '#bbbbbb',
    errorToastBackground: '#282a36',
    errorToastForeground: '#ff5555', // red
    errorToastBorder: '#ff5555', // red
    infoToastBackground: '#282a36',
    infoToastForeground: '#8be9fd', // cyan
    infoToastBorder: '#8be9fd', // cyan
  },

  // Gruvbox Dark
  gruvbox_dark: {
    background: '#282828',
    foreground: '#ebdbb2',
    border: '#a89984', // normal white
    searchBackground: '#ebdbb2', // foreground
    searchForeground: '#282828', // background
    searchBorder: '#ebdbb2',
    statusBackground: '#282828',
    statusForeground: '#ebdbb2',
    statusBorder: '#a89984',
    selectedBackground: '#928374', // bright black
    selectedForeground: '#8ec07c', // bright cyan
    deleteDialogBackground: '#282828',
    deleteDialogForeground: '#ebdbb2',
    deleteDialogBorder: '#fb4934', // bright red
    dialogBackground: '#282828',
    dialogForeground: '#ebdbb2',
    dialogBorder: '#a89984',
    errorToastBackground: '#282828',
    errorToastForeground: '#fb4934', // bright red
    errorToastBorder: '#fb4934', // bright red
    infoToastBackground: '#282828',
    infoToastForeground: '#8ec07c', // bright cyan
    infoToastBorder: '#8ec07c', // bright cyan
  },

  // Gruvbox Light
  gruvbox_light: {
    background: '#fbf1c7',
    foreground: '#3c3836',
    border: '#7c6f64', // normal white
    searchBackground: '#3c3836', // bright white (dark fg)
    searchForeground: '#fbf1c7', // background
    searchBorder: '#3c3836',
    statusBackground: '#fbf1c7',
    statusForeground: '#3c3836',
    statusBorder: '#7c6f64',
    selectedBackground: '#928374', // bright black
    selectedForeground: '#427b58', // bright cyan
    deleteDialogBackground: '#fbf1c7',
    deleteDialogForeground: '#3c3836',
    deleteDialogBorder: '#9d0006', // bright red
    dialogBackground: '#fbf1c7',
    dialogForeground: '#3c3836',
    dialogBorder: '#7c6f64',
    errorToastBackground: '#fbf1c7',
    errorToastForeground: '#9d0006', // bright red
    errorToastBorder: '#9d0006', // bright red
    infoToastBackground: '#fbf1c7',
    infoToastForeground: '#427b58', // bright cyan
    infoToastBorder: '#427b58', // bright cyan
  },

  // Monokai Pro
  monokai_pro: {
    background: '#2D2A2E',
    foreground: '#fff1f3',
    border: '#72696a', // bright black
    searchBackground: '#fff1f3', // foreground
    searchForeground: '#2D2A2E', // background
    searchBorder: '#fff1f3',
    statusBackground: '#2D2A2E',
    statusForeground: '#fff1f3',
    statusBorder: '#72696a',
    selectedBackground: '#72696a', // bright black
    selectedForeground: '#85dacc', // cyan
    deleteDialogBackground: '#2D2A2E',
    deleteDialogForeground: '#fff1f3',
    deleteDialogBorder: '#fd6883', // red
    dialogBackground: '#2D2A2E',
    dialogForeground: '#fff1f3',
    dialogBorder: '#72696a',
    errorToastBackground: '#2D2A2E',
    errorToastForeground: '#fd6883', // red
    errorToastBorder: '#fd6883', // red
    infoToastBackground: '#2D2A2E',
    infoToastForeground: '#85dacc', // cyan
    infoToastBorder: '#85dacc', // cyan
  },

  // Nord Light
  nord_light: {
    background: '#ECEFF4',
    foreground: '#4C566A', // normal white (dark)
    border: '#81A1C1', // normal blue
    searchBackground: '#4C566A', // dark fg
    searchForeground: '#ECEFF4', // background
    searchBorder: '#4C566A',
    statusBackground: '#ECEFF4',
    statusForeground: '#4C566A',
    statusBorder: '#81A1C1',
    selectedBackground: '#D8DEE9', // normal black (light grey)
    selectedForeground: '#88C0D0', // cyan
    deleteDialogBackground: '#ECEFF4',
    deleteDialogForeground: '#4C566A',
    deleteDialogBorder: '#bf616a', // red
    dialogBackground: '#ECEFF4',
    dialogForeground: '#4C566A',
    dialogBorder: '#81A1C1',
    errorToastBackground: '#ECEFF4',
    errorToastForeground: '#bf616a', // red
    errorToastBorder: '#bf616a', // red
    infoToastBackground: '#ECEFF4',
    infoToastForeground: '#88C0D0', // cyan
    infoToastBorder: '#88C0D0', // cyan
  },

  // Tokyo Night
  tokyo_night: {
    background: '#1a1b26',
    foreground: '#a9b1d6',
    border: '#787c99', // normal white
    searchBackground: '#a9b1d6', // foreground
    searchForeground: '#1a1b26', // background
    searchBorder: '#a9b1d6',
    statusBackground: '#1a1b26',
    statusForeground: '#a9b1d6',
    statusBorder: '#787c99',
    selectedBackground: '#444b6a', // bright black
    selectedForeground: '#0db9d7', // bright cyan
    deleteDialogBackground: '#1a1b26',
    deleteDialogForeground: '#a9b1d6',
    deleteDialogBorder: '#ff7a93', // bright red
    dialogBackground: '#1a1b26',
    dialogForeground: '#a9b1d6',
    dialogBorder: '#787c99',
    errorToastBackground: '#1a1b26',
    errorToastForeground: '#ff7a93', // bright red
    errorToastBorder: '#ff7a93', // bright red
    infoToastBackground: '#1a1b26',
    infoToastForeground: '#0db9d7', // bright cyan
    infoToastBorder: '#0db9d7', // bright cyan
  },

  // Tokyo Night Light
  tokyo_night_light: {
    background: '#d6d8df',
    foreground: '#343B58',
    border: '#707280', // normal white
    searchBackground: '#343B58', // dark fg
    searchForeground: '#d6d8df', // background
    searchBorder: '#343B58',
    statusBackground: '#d6d8df',
    statusForeground: '#343B58',
    statusBorder: '#707280',
    selectedBackground: '#acb0bf', // selection background
    selectedForeground: '#006c86', // cyan
    deleteDialogBackground: '#d6d8df',
    deleteDialogForeground: '#343B58',
    deleteDialogBorder: '#c24242', // red
    dialogBackground: '#d6d8df',
    dialogForeground: '#343B58',
    dialogBorder: '#707280',
    errorToastBackground: '#d6d8df',
    errorToastForeground: '#c24242', // red
    errorToastBorder: '#c24242', // red
    infoToastBackground: '#d6d8df',
    infoToastForeground: '#006c86', // cyan
    infoToastBorder: '#006c86', // cyan
  },

  // Ayu Dark
  ayu_dark: {
    background: '#0A0E14',
    foreground: '#B3B1AD',
    border: '#C7C7C7', // normal white
    searchBackground: '#C7C7C7', // normal white
    searchForeground: '#0A0E14', // background
    searchBorder: '#C7C7C7',
    statusBackground: '#0A0E14',
    statusForeground: '#B3B1AD',
    statusBorder: '#C7C7C7',
    selectedBackground: '#686868', // bright black
    selectedForeground: '#90E1C6', // normal cyan
    deleteDialogBackground: '#0A0E14',
    deleteDialogForeground: '#B3B1AD',
    deleteDialogBorder: '#F07178', // bright red
    dialogBackground: '#0A0E14',
    dialogForeground: '#B3B1AD',
    dialogBorder: '#C7C7C7',
    errorToastBackground: '#0A0E14',
    errorToastForeground: '#F07178', // bright red
    errorToastBorder: '#F07178', // bright red
    infoToastBackground: '#0A0E14',
    infoToastForeground: '#90E1C6', // normal cyan
    infoToastBorder: '#90E1C6', // normal cyan
  },

  // Ayu Light
  ayu_light: {
    background: '#FCFCFC',
    foreground: '#5C6166',
    border: '#c1c1c1', // normal white
    searchBackground: '#5C6166', // dark fg
    searchForeground: '#FCFCFC', // background
    searchBorder: '#5C6166',
    statusBackground: '#FCFCFC',
    statusForeground: '#5C6166',
    statusBorder: '#c1c1c1',
    selectedBackground: '#343434', // bright black
    selectedForeground: '#51b891', // cyan
    deleteDialogBackground: '#FCFCFC',
    deleteDialogForeground: '#5C6166',
    deleteDialogBorder: '#e7666a', // red
    dialogBackground: '#FCFCFC',
    dialogForeground: '#5C6166',
    dialogBorder: '#c1c1c1',
    errorToastBackground: '#FCFCFC',
    errorToastForeground: '#e7666a', // red
    errorToastBorder: '#e7666a', // red
    infoToastBackground: '#FCFCFC',
    infoToastForeground: '#51b891', // cyan
    infoToastBorder: '#51b891', // cyan
  },
};

export const DEFAULT_COLORSCHEME_DEFINITION: ColorSchemesDefinition =
  DEFAULT_COLORSCHEME_DEFINITIONS[DEFAULT_COLORSCHEME_NAME]!;
