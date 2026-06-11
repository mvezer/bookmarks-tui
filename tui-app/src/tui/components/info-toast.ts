import { CliRenderer } from '@opentui/core';
import type { ColorScheme } from '../../colorscheme';
import { Toast } from './toast';

export const infoToast = (
  renderer: CliRenderer,
  colorScheme: ColorScheme,
  text: string,
  timeout: number = 4000,
): void => {
  const toast = new Toast(renderer, colorScheme, {
    text,
    timeout,
    backgroundColor: colorScheme.infoToastBackground,
    foregroundColor: colorScheme.infoToastForeground,
    borderColor: colorScheme.infoToastBorder,
  });
  toast.show();
};
