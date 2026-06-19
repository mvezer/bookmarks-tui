declare const __VERSION__: string;
declare const __BUILD_DATE__: string;

export const VERSION =
  typeof __VERSION__ !== 'undefined' ? __VERSION__ : 'DEBUG';
export const BUILD_DATE =
  typeof __BUILD_DATE__ !== 'undefined'
    ? __BUILD_DATE__
    : new Date().toISOString();
