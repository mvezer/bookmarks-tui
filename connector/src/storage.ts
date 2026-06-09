import { BookmarkChange, IChangeStorage } from '@bookmarks-tui/common';

const BOOKMARK_TRACKING_PREFIX = 'track-';
const STATS_KEY = 'stats';

export interface BookmarkTrackingPayload {
  hash: string;
  modified: number;
}
export interface BookmarkTracking {
  [key: string]: BookmarkTrackingPayload;
}

export interface Stats {
  bookmarks: number;
  changesReceived: number;
  changesProcessed: number;
  changesSent: number;
  pendingChanges: number;
}

export interface StoredStats {
  [STATS_KEY]: Omit<Stats, 'pendingChanges' | 'bookmarks'>;
}

export interface IBookmarkTrackingStorage {
  getAllBookmarkTracking(): Promise<BookmarkTracking>;
  setBookmarkTracking(tracking: BookmarkTracking): Promise<void>;
}

export class Storage implements IChangeStorage, IBookmarkTrackingStorage {
  private _bookmarkIds = new Set<string>();
  private _bookmarkChangeIds = new Set<string>();
  private _stats: Stats = {
    bookmarks: 0,
    pendingChanges: 0,
    changesReceived: 0,
    changesProcessed: 0,
    changesSent: 0,
  };

  constructor() {}

  private _isInitialized = false;

  async init(): Promise<void> {
    if (this._isInitialized) {
      return;
    }
    const keys = await chrome.storage.local.getKeys();
    keys.forEach((key) => {
      if (key.startsWith(BOOKMARK_TRACKING_PREFIX)) {
        this._bookmarkIds.add(key);
      } else if (key !== STATS_KEY) {
        this._bookmarkChangeIds.add(key);
      }
    });
    await this.loadStats();
    this._stats.pendingChanges = this._bookmarkChangeIds.size;
    this._stats.bookmarks = this._bookmarkIds.size;
    this._isInitialized = true;
  }

  async loadStats(): Promise<void> {
    try {
      const storedStats = (
        await chrome.storage.local.get<StoredStats>([STATS_KEY])
      )?.[STATS_KEY];
      this._stats = {
        ...this._stats,
        ...storedStats,
      };
    } catch (e) {
      console.info('Could not load stats', e);
    }
  }

  async saveStats(): Promise<void> {
    if (!this._isInitialized) {
      await this.init();
    }
    try {
      const { changesReceived, changesProcessed, changesSent } = this._stats;
      await chrome.storage.local.set({
        [STATS_KEY]: { changesProcessed, changesReceived, changesSent },
      });
    } catch (e) {
      console.info('Could not save stats', e);
    }
  }

  async getAllBookmarkTracking(): Promise<BookmarkTracking> {
    if (!this._isInitialized) {
      await this.init();
    }
    if (this._bookmarkIds.size === 0) {
      return {};
    }
    const trackingEntries = await chrome.storage.local.get<BookmarkTracking>(
      Array.from(this._bookmarkIds),
    );
    if (trackingEntries === undefined) {
      return {};
    }
    return Object.entries(trackingEntries).reduce(
      (acc: BookmarkTracking, [id, trackingPayload]) => {
        const { hash, modified } = trackingPayload;
        acc[id.replace(BOOKMARK_TRACKING_PREFIX, '')] = { hash, modified }; // remove the key prefix
        return acc;
      },
      {},
    );
  }

  async getAllBookmarkChanges(): Promise<{ [key: string]: BookmarkChange }> {
    if (!this._isInitialized) {
      await this.init();
    }
    if (this._bookmarkChangeIds.size === 0) {
      return {};
    }
    return chrome.storage.local.get<{ [key: string]: BookmarkChange }>(
      Array.from(this._bookmarkChangeIds),
    );
  }

  async removeBookmarkChange(changeId: string): Promise<boolean> {
    if (!this._isInitialized) {
      await this.init();
    }
    if (!this._bookmarkChangeIds.has(changeId)) {
      return false;
    }
    await chrome.storage.local.remove(changeId);
    this._bookmarkChangeIds.delete(changeId);
    return true;
  }

  async addBookmarkChange(change: {
    [key: string]: BookmarkChange;
  }): Promise<void> {
    if (!this._isInitialized) {
      await this.init();
    }
    await chrome.storage.local.set(change);
    Object.keys(change).forEach((key) => {
      this._bookmarkChangeIds.add(key);
    });
  }

  async setBookmarkTracking(tracking: BookmarkTracking): Promise<void> {
    if (!this._isInitialized) {
      await this.init();
    }
    const trackingInfo = Object.entries(tracking).reduce(
      (acc: BookmarkTracking, [id, trackingPayload]) => {
        const { hash, modified } = trackingPayload;
        acc[`${BOOKMARK_TRACKING_PREFIX}${id}`] = { hash, modified };
        return acc;
      },
      {},
    );
    await chrome.storage.local.set(trackingInfo);
    Object.keys(tracking).forEach((key) => {
      this._bookmarkIds.add(key);
    });
  }

  async removeBookmarkTracking(id: string): Promise<void> {
    if (!this._isInitialized) {
      await this.init();
    }
    await chrome.storage.local.remove(`${BOOKMARK_TRACKING_PREFIX}${id}`);
    this._bookmarkIds.delete(id);
  }

  get stats(): Stats {
    return this._stats;
  }
}
