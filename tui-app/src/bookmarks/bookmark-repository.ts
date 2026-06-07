import {
  type Bookmark,
  BookmarkChangeRepository,
  ReverseLookupFieldMap,
} from '@bookmarks-tui/common';
import Fuse from 'fuse.js';

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
  );
  private _isInitialized = false;

  constructor(
    private _changes: BookmarkChangeRepository,
    private _db?: IBookmarkStorage,
    private _fuse?: Fuse<Bookmark>,
  ) {}

  async init(): Promise<void> {
    if (this._isInitialized) {
      return;
    }
    if (this._db) {
      const bookmarks = await this._db.getAllBookmarks();
      for (const b of bookmarks) {
        this._bookmarks.set(b.id, b);
        this._fuse?.add(b);
      }
    }
    this._isInitialized = true;
  }

  async setBookmark(bookmark: Bookmark, disableChanges = false): Promise<void> {
    let exists = false;
    let idChanged = false;
    let contentChanged = false;

    const existingBookmark = this._bookmarks.get(bookmark.id);
    exists = existingBookmark !== undefined;
    if (exists) {
      contentChanged = existingBookmark!.hash !== bookmark.hash;
    } else {
      if (this._bookmarks.reverseHas(bookmark.hash)) {
        idChanged = true;
      }
    }
    // the bookmark already exists with the same hash and id - nothing to do
    if (exists && !contentChanged) {
      return;
    }

    // if the content changed but the existing bookmark is newer than the incoming one - we don't do anything
    if (contentChanged && bookmark.modified < existingBookmark!.modified) {
      return;
    }

    // we delete the old bookmark and add the new one
    // we don's report the change for id changes
    if (idChanged) {
      const existingId = this._bookmarks.reverseGetKey(bookmark.hash)!;
      // remove the old bookmark (with the old id)
      this._bookmarks.delete(existingId);
      await this._db?.removeBookmark(existingId);
      // add the new bookmark
      this._bookmarks.set(bookmark.id, bookmark);
      await this._db?.setBookmark(bookmark);
      // update fuse
      this._fuse?.remove((b) => b.id === existingId);
      this._fuse?.add(bookmark);

      // the bookmark is brand new or the content changed
    } else {
      if (contentChanged) {
        this._fuse?.remove((b) => b.id === bookmark.id);
      }
      this._bookmarks.set(bookmark.id, bookmark);
      await this._db?.setBookmark(bookmark);
      this._fuse?.add(bookmark);
      if (!disableChanges) {
        await this._changes.add(bookmark);
      }
    }
  }

  async removeBookmark(
    bookmarkId: string,
    disableChanges = false,
  ): Promise<void> {
    if (this._bookmarks.has(bookmarkId)) {
      this._bookmarks.delete(bookmarkId);
      await this._db?.removeBookmark(bookmarkId);
      this._fuse?.remove((b) => b.id === bookmarkId);
      if (!disableChanges) {
        await this._changes.add(bookmarkId);
      }
    }
  }

  get bookmarks(): MapIterator<Bookmark> {
    return this._bookmarks.values();
  }

  search(query: string): Bookmark[] {
    return this._fuse?.search(query).map((item) => item.item) ?? [];
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
