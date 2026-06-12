import type { ColorSchemesDefinition } from './types';

export const DEFAULT_COLORSCHEME_NAME: string = 'ayu_dark';

export const DEFAULT_COLORSCHEME_DEFINITIONS: Record<
  string,
  ColorSchemesDefinition
> = {
  // Ayu Dark
  ayu_dark: {
    background: '#0A0E14',
    foreground: '#B3B1AD',
    border: '#C7C7C7',
    searchBackground: '#0A0E14',
    searchForeground: '#C2D94C',
    searchBorder: '#C7C7C7',
    statusBackground: '#0A0E14',
    statusForeground: '#59C2FF',
    statusBorder: '#C7C7C7',
    selectedBackground: '#F9AF4F',
    selectedForeground: '#01060E',
    deleteDialogBackground: '#EA6C73',
    deleteDialogForeground: '#01060E',
    deleteDialogBorder: '#01060E',
    dialogBackground: '#0A0E14',
    dialogForeground: '#B3B1AD',
    dialogBorder: '#C7C7C7',
    errorToastBackground: '#F07178',
    errorToastForeground: '#01060E',
    errorToastBorder: '#01060E',
    infoToastBackground: '#0A0E14',
    infoToastForeground: '#90E1C6',
    infoToastBorder: '#90E1C6',
  },
  // Ayu Light
  ayu_light: {
    background: '#FCFCFC',
    foreground: '#5C6166',
    border: '#c1c1c1',
    searchBackground: '#FCFCFC',
    searchForeground: '#80ab24',
    searchBorder: '#010101',
    statusBackground: '#FCFCFC',
    statusForeground: '#4196df',
    statusBorder: '#c1c1c1',
    selectedBackground: '#eba54d',
    selectedForeground: '#FCFCFC',
    deleteDialogBackground: '#FCFCFC',
    deleteDialogForeground: '#5C6166',
    deleteDialogBorder: '#e7666a',
    dialogBackground: '#FCFCFC',
    dialogForeground: '#5C6166',
    dialogBorder: '#FCFCFC',
    errorToastForeground: '#FCFCFC',
    errorToastBackground: '#e7666a',
    errorToastBorder: '#FCFCFC',
    infoToastBackground: '#FCFCFC',
    infoToastForeground: '#51b891',
    infoToastBorder: '#51b891',
  },
  // Catppuccin Frappé
  catppuccin_frappe: {
    background: '#303446',
    foreground: '#C6D0F5',
    border: '#A5ADCE',
    searchBackground: '#303446',
    searchForeground: '#F4B8E4',
    searchBorder: '#A5ADCE',
    statusBackground: '#303446',
    statusForeground: '#8CAAEE',
    statusBorder: '#A5ADCE',
    selectedBackground: '#626880',
    selectedForeground: '#81C8BE',
    deleteDialogBackground: '#303446',
    deleteDialogForeground: '#C6D0F5',
    deleteDialogBorder: '#E78284',
    dialogBackground: '#303446',
    dialogForeground: '#C6D0F5',
    dialogBorder: '#A5ADCE',
    errorToastBackground: '#303446',
    errorToastForeground: '#E78284',
    errorToastBorder: '#E78284',
    infoToastBackground: '#303446',
    infoToastForeground: '#81C8BE',
    infoToastBorder: '#81C8BE',
  },

  // Catppuccin Mocha
  catppuccin_mocha: {
    background: '#1E1E2E', // base
    foreground: '#CDD6F4', // text
    border: '#A6ADC8', // subtext0
    searchBackground: '#1E1E2E', // subtext0
    searchForeground: '#F5C2E7', // base
    searchBorder: '#CDD6F4', // subtext0
    statusBackground: '#1E1E2E', // base
    statusForeground: '#89B4FA', // text
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
    background: '#24273A',
    foreground: '#CAD3F5',
    border: '#A5ADCB',
    searchBackground: '#24273A',
    searchForeground: '#F5BDE6',
    searchBorder: '#A5ADCB',
    statusBackground: '#24273A',
    statusForeground: '#8AADF4',
    statusBorder: '#A5ADCB',
    selectedBackground: '#5B6078',
    selectedForeground: '#8BD5CA',
    deleteDialogBackground: '#24273A',
    deleteDialogForeground: '#CAD3F5',
    deleteDialogBorder: '#ED8796',
    dialogBackground: '#24273A',
    dialogForeground: '#CAD3F5',
    dialogBorder: '#A5ADCB',
    errorToastBackground: '#24273A',
    errorToastForeground: '#ED8796',
    errorToastBorder: '#ED8796',
    infoToastBackground: '#24273A',
    infoToastForeground: '#8BD5CA',
    infoToastBorder: '#8BD5CA',
  },

  // Dracula
  dracula: {
    background: '#282a36',
    foreground: '#f8f8f2',
    border: '#bbbbbb',
    searchBackground: '#282a36',
    searchForeground: '#8be9fd',
    searchBorder: '#f8f8f2',
    statusBackground: '#282a36',
    statusForeground: '#bd93f9',
    statusBorder: '#bbbbbb',
    selectedBackground: '#ff5555',
    selectedForeground: '#000000',
    deleteDialogBackground: '#282a36',
    deleteDialogForeground: '#f8f8f2',
    deleteDialogBorder: '#ff5555',
    dialogBackground: '#282a36',
    dialogForeground: '#f8f8f2',
    dialogBorder: '#bbbbbb',
    errorToastBackground: '#282a36',
    errorToastForeground: '#ff5555',
    errorToastBorder: '#ff5555',
    infoToastBackground: '#282a36',
    infoToastForeground: '#8be9fd',
    infoToastBorder: '#8be9fd',
  },

  // Gruvbox Dark
  gruvbox_dark: {
    background: '#282828',
    foreground: '#ebdbb2',
    border: '#a89984',
    searchBackground: '#282828',
    searchForeground: '#fabd2f',
    searchBorder: '#ebdbb2',
    statusBackground: '#282828',
    statusForeground: '#458588',
    statusBorder: '#a89984',
    selectedBackground: '#98971a',
    selectedForeground: '#282828',
    deleteDialogBackground: '#282828',
    deleteDialogForeground: '#ebdbb2',
    deleteDialogBorder: '#fb4934',
    dialogBackground: '#282828',
    dialogForeground: '#ebdbb2',
    dialogBorder: '#a89984',
    errorToastBackground: '#282828',
    errorToastForeground: '#fb4934',
    errorToastBorder: '#fb4934',
    infoToastBackground: '#282828',
    infoToastForeground: '#8ec07c',
    infoToastBorder: '#8ec07c',
  },

  // Gruvbox Light
  gruvbox_light: {
    background: '#fbf1c7',
    foreground: '#3c3836',
    border: '#7c6f64',
    searchBackground: '#fbf1c7',
    searchForeground: '#b16286',
    searchBorder: '#3c3836',
    statusBackground: '#fbf1c7',
    statusForeground: '#458588',
    statusBorder: '#7c6f64',
    selectedBackground: '#98971a',
    selectedForeground: '#3c3836',
    deleteDialogBackground: '#fbf1c7',
    deleteDialogForeground: '#3c3836',
    deleteDialogBorder: '#9d0006',
    dialogBackground: '#fbf1c7',
    dialogForeground: '#3c3836',
    dialogBorder: '#7c6f64',
    errorToastBackground: '#fbf1c7',
    errorToastForeground: '#9d0006',
    errorToastBorder: '#9d0006',
    infoToastBackground: '#fbf1c7',
    infoToastForeground: '#427b58',
    infoToastBorder: '#427b58',
  },

  // Monokai Pro
  monokai_pro: {
    background: '#2D2A2E',
    foreground: '#fff1f3',
    border: '#72696a',
    searchBackground: '#2D2A2E',
    searchForeground: '#f9cc6c',
    searchBorder: '#fff1f3',
    statusBackground: '#2D2A2E',
    statusForeground: '#f38d70',
    statusBorder: '#72696a',
    selectedBackground: '#a8a9eb',
    selectedForeground: '#2c2525',
    deleteDialogBackground: '#2D2A2E',
    deleteDialogForeground: '#fff1f3',
    deleteDialogBorder: '#fd6883',
    dialogBackground: '#2D2A2E',
    dialogForeground: '#fff1f3',
    dialogBorder: '#72696a',
    errorToastBackground: '#2D2A2E',
    errorToastForeground: '#fd6883',
    errorToastBorder: '#fd6883',
    infoToastBackground: '#2D2A2E',
    infoToastForeground: '#85dacc',
    infoToastBorder: '#85dacc',
  },

  // Nord Light
  nord_light: {
    background: '#ECEFF4',
    foreground: '#4C566A', // normal white (dark)
    border: '#81A1C1', // normal blue
    searchBackground: '#ECEFF4', // dark fg
    searchForeground: '#B48EAD', // background
    searchBorder: '#4C566A',
    statusBackground: '#ECEFF4',
    statusForeground: '#81A1C1',
    statusBorder: '#81A1C1',
    selectedBackground: '#D8DEE9', // normal black (light grey)
    selectedForeground: '#81A1C1', // cyan
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
    searchBackground: '#1a1b26', // foreground
    searchForeground: '#ff9e64', // background
    searchBorder: '#a9b1d6',
    statusBackground: '#1a1b26',
    statusForeground: '#7da6ff',
    statusBorder: '#787c99',
    selectedBackground: '#ad8ee6', // bright black
    selectedForeground: '#32344a', // bright cyan
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
    searchBackground: '#d6d8df', // dark fg
    searchForeground: '#41a6b5', // background
    searchBorder: '#343B58',
    statusBackground: '#d6d8df',
    statusForeground: '#2959aa',
    statusBorder: '#707280',
    selectedBackground: '#acb0bf', // selection background
    selectedForeground: '#7b43ba', // cyan
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
};

export const DEFAULT_COLORSCHEME_DEFINITION: ColorSchemesDefinition =
  DEFAULT_COLORSCHEME_DEFINITIONS[DEFAULT_COLORSCHEME_NAME]!;
