import { PORT } from '@bookmarks-tui/common/constants';
export const SETTINGS_KEY = 'settings';

export interface ISettings {
  clientId: string;
  bookmarksTuiFolderId: string;
  heartbeatIntervalMinutes: number;
  hostPort: number;
}

const DEFAULT_SETTINGS: ISettings = {
  clientId: '',
  bookmarksTuiFolderId: '',
  heartbeatIntervalMinutes: 1 / 12,
  hostPort: PORT,
};

export class Settings {
  private static _instance: Settings;

  private constructor(private _settings: ISettings) {}

  static async create(): Promise<Settings> {
    if (Settings._instance) {
      return Settings._instance;
    }
    const { settings } = await chrome.storage.local.get<{
      [SETTINGS_KEY]: ISettings;
    }>([SETTINGS_KEY]);
    Settings._instance = new Settings(settings || DEFAULT_SETTINGS);
    return Settings._instance;
  }
  static get instance(): Settings {
    if (!Settings._instance) {
      throw new Error('Settings not initialized');
    }
    return Settings._instance;
  }

  get<K extends keyof ISettings>(key: K): ISettings[K] {
    return this._settings[key];
  }

  async set<K extends keyof ISettings>(
    key: K,
    value: ISettings[K],
  ): Promise<void> {
    this._settings[key] = value;
    chrome.storage.local.set({ [SETTINGS_KEY]: this._settings });
  }
}
