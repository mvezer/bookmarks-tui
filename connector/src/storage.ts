import { BookmarkChange, IChangeStorage } from '@bookmarks-tui/common';

const BOOKMARK_HASK_PREFIX = 'bh-';

interface IHashStorage {
  getAllBookmarkHashes(): Promise<{ [key: string]: string }>;
  setBookmarkHashes(hashes: { [key: string]: string }): Promise<void>;
}

export class Storage implements IChangeStorage, IHashStorage {
  private _bookmarkHashKeys = new Set<string>();
  private _bookmarkChangeKeys = new Set<string>();

  constructor() {}

  private _isInitialized = false;

  async init(): Promise<void> {
    const keys = await chrome.storage.local.getKeys();
    keys.forEach((key) => {
      if (key.startsWith(BOOKMARK_HASK_PREFIX)) {
        this._bookmarkHashKeys.add(key);
      } else {
        this._bookmarkChangeKeys.add(key);
      }
    });
    this._isInitialized = true;
  }

  async getAllBookmarkHashes(): Promise<{ [key: string]: string }> {
    if (!this._isInitialized) {
      await this.init();
    }
    if (this._bookmarkHashKeys.size === 0) {
      return {};
    }
    const hashes = await chrome.storage.local.get<{
      [key: string]: string;
    }>(Array.from(this._bookmarkHashKeys));
    if (hashes === undefined) {
      return {};
    }
    return Object.entries(hashes).reduce(
      (acc: { [key: string]: string }, [id, hash]) => {
        acc[id.replace(BOOKMARK_HASK_PREFIX, '')] = hash; // remove the key prefix
        return acc;
      },
      {},
    );
  }

  async getAllBookmarkChanges(): Promise<{ [key: string]: BookmarkChange }> {
    if (!this._isInitialized) {
      await this.init();
    }
    if (this._bookmarkChangeKeys.size === 0) {
      return {};
    }
    return chrome.storage.local.get<{ [key: string]: BookmarkChange }>(
      Array.from(this._bookmarkChangeKeys),
    );
  }

  async removeBookmarkChange(changeId: string): Promise<boolean> {
    if (!this._isInitialized) {
      await this.init();
    }
    if (!this._bookmarkChangeKeys.has(changeId)) {
      return false;
    }
    await chrome.storage.local.remove(changeId);
    this._bookmarkChangeKeys.delete(changeId);
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
      this._bookmarkChangeKeys.add(key);
    });
  }

  async setBookmarkHashes(hashes: { [key: string]: string }): Promise<void> {
    if (!this._isInitialized) {
      await this.init();
    }
    const storageHashes = Object.entries(hashes).reduce(
      (acc: { [key: string]: string }, [id, hash]) => {
        acc[`${BOOKMARK_HASK_PREFIX}${id}`] = hash;
        return acc;
      },
      {},
    );
    await chrome.storage.local.set(storageHashes);
    Object.keys(hashes).forEach((key) => {
      this._bookmarkHashKeys.add(key);
    });
  }
}
