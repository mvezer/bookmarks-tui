// default behavior - opens the url in the default browser
const getDefaultCommand = (): string => {
  if (process.platform === 'darwin') {
    return 'open';
  } else {
    // linux
    return 'xdg-open';
  }
};
// string split respecting quotes
export const openUrl = (url: string, urlOpenCommand?: string): void => {
  if (!url) {
    return;
  }
  const command = urlOpenCommand || getDefaultCommand();
  Bun.spawn([command, url], {
    stdio: ['ignore', 'ignore', 'ignore'],
  });
};
