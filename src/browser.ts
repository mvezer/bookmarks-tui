export const openUrl = (url: string): void => {
  if (!url) {
    return;
  }
  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  Bun.spawn([opener, url], { stdio: ["ignore", "ignore", "ignore"] });
};
