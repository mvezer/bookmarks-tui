import * as packageJson from '../../package.json';

const { version } = packageJson ?? 'unknown';
export const APP_VERSION = version;
