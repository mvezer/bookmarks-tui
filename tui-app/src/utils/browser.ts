// default behavior - opens the url in the default browser
export const getDefaultBrowserCommand = (): string => {
  if (process.platform === 'darwin') {
    return 'open';
  } else {
    return 'xdg-open';
  }
};

export const openUrl = (url: string, urlOpenCommand?: string): void => {
  if (!url) {
    return;
  }
  const command = urlOpenCommand || getDefaultBrowserCommand();
  console.log(command, url, urlOpenCommand);
  Bun.spawn([command, url], {
    stdio: ['ignore', 'ignore', 'ignore'],
  });
};
