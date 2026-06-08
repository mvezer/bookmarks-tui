// default behavior - opens the url in the default browser
const getOpenerBinary = (): string => {
  if (process.platform === 'darwin') {
    return 'open';
  }
  if (process.platform === 'win32') {
    return 'start';
  }
  return 'xdg-open';
};
export const openUrl = (url: string): void => {
  if (!url) {
    return;
  }
  Bun.spawn([getOpenerBinary(), url], {
    stdio: ['ignore', 'ignore', 'ignore'],
  });
};
