import { CliRenderer } from '@opentui/core';
import type { ColorScheme } from '../../colorscheme';
import { Toast } from './base-toast';

export const errorToast = (
  renderer: CliRenderer,
  colorScheme: ColorScheme,
  text: string,
  timeout: number = 4000,
): void => {
  const toast = new Toast(renderer, colorScheme, {
    text,
    timeout,
    backgroundColor: colorScheme.deleteDialogBackground,
    foregroundColor: colorScheme.deleteDialogForeground,
    borderColor: colorScheme.deleteDialogBorder,
  });
  toast.show();
};
