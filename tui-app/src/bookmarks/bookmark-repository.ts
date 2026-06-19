import { type Bookmark } from '@bookmarks-tui/common/bookmarks';
import { ReverseLookupFieldMap } from '@bookmarks-tui/common/reverse-lookup-map';

import Fuse from 'fuse.js';
import type { Db } from './db';

export interface IBookmarkStorage {
  init(): Promise<void>;
  getAllBookmarks(): Promise<Bookmark[]>;
  getBookmark(bookmarkId: string): Promise<Bookmark | undefined>;
  setBookmark(bookmark: Bookmark): Promise<void>;
  removeBookmark(bookmarkId: string): Promise<void>;
}

export enum BookmarkRepositoryState {
  Exists,
  ContentChanged,
  IdChanged,
  NotExists,
}

export class BookmarkRepository {
  private _bookmarks = new ReverseLookupFieldMap<string, Bookmark, 'hash'>(
    'hash',
  ); // uid -> hash, hash -> uid
  private _isInitialized = false;
  private _fuse: Fuse<Bookmark>;

  constructor(private _db: Db) {
    this._fuse = new Fuse<Bookmark>([], {
      keys: ['title'],
      includeScore: false,
    });
  }

  init(): void {
    if (this._isInitialized) {
      return;
    }
    this._db.init();
    if (this._db) {
      const bookmarks = this._db.getAllBookmarks();
      for (const b of bookmarks) {
        this._bookmarks.set(b.uid, b);
        this._fuse.add(b);
      }
    }
    this._isInitialized = true;
  }

  async setBookmark(bookmark: Bookmark, clientId?: string): Promise<void> {
    const existingBookmark = this._bookmarks.get(bookmark.uid);
    const exists = existingBookmark !== undefined;
    const contentChanged = exists && existingBookmark!.hash !== bookmark.hash;

    // the bookmark already exists with the same hash and id - nothing to update,
    // but we still need to record that this client knows about it
    if (exists && !contentChanged) {
      if (clientId) {
        this.confirmSync(bookmark.uid, clientId);
      }
      return;
    }

    // if the content changed but the existing bookmark is newer than the incoming one,
    // we don't overwrite it, but we still confirm the sync for this client
    if (contentChanged && bookmark.modified < existingBookmark!.modified) {
      if (clientId) {
        this.confirmSync(bookmark.uid, clientId);
      }
      return;
    }

    if (contentChanged) {
      this._fuse.remove((b) => b.uid === bookmark.uid);
      bookmark.modified = Date.now();
    }
    this._bookmarks.set(bookmark.uid, bookmark);
    if (clientId) {
      this.confirmSync(bookmark.uid, clientId);
    }
    this._db.setBookmark(bookmark);
    this._fuse.add(bookmark);
  }

  async removeBookmark(bookmarkUid: string, clientId?: string): Promise<void> {
    if (this._bookmarks.has(bookmarkUid)) {
      this._bookmarks.delete(bookmarkUid);
      this._db.removeBookmark(bookmarkUid);
      if (clientId) {
        this.confirmSync(bookmarkUid, clientId);
      }
      this._fuse.remove((b) => b.uid === bookmarkUid);
    }
  }

  async confirmSync(bookmarkId: string, clientId: string): Promise<void> {
    this._db.confirmSync(bookmarkId, clientId);
  }

  get bookmarks(): Bookmark[] {
    return Array.from(this._bookmarks.values());
  }

  search(query: string): Bookmark[] {
    return this._fuse.search(query).map((item) => item.item) ?? [];
  }

  get size(): number {
    return this._bookmarks.size;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  getBookmarkByHash(hash: string): Bookmark | undefined {
    return this._bookmarks.reverseGet(hash);
  }

  getBookmark(id: string): Bookmark | undefined {
    return this._bookmarks.get(id);
  }
}
