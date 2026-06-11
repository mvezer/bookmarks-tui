import { CliRenderer } from '@opentui/core';
import type { ColorScheme } from '../../colorscheme';
import { Toast } from './toast';

export const errorToast = (
  renderer: CliRenderer,
  colorScheme: ColorScheme,
  error: string | Error | unknown,
  timeout: number = 4000,
): void => {
  const toast = new Toast(renderer, colorScheme, {
    text:
      typeof error === 'string'
        ? error
        : (error as Error).message || 'Unknown error',
    timeout,
    backgroundColor: colorScheme.deleteDialogBackground,
    foregroundColor: colorScheme.deleteDialogForeground,
    borderColor: colorScheme.deleteDialogBorder,
  });
  toast.show();
};
