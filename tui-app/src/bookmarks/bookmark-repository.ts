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
    const bookmarkRepositoryState = this.getBookmarkRepositoryState(bookmark);
    if (bookmarkRepositoryState === BookmarkRepositoryState.Exists) {
      return;
    }
    switch (bookmarkRepositoryState) {
      case BookmarkRepositoryState.IdChanged:
        const oldId = this._bookmarks.reverseGetKey(bookmark.hash)!;
        this._bookmarks.delete(oldId);
        this._fuse?.remove((b) => b.id === oldId);
        await this._db?.removeBookmark(oldId);
        // not storing the change for id changes!
        // if (!disableChanges) {
        //   await this.addChangeEntry(oldId);
        // }
        await this._db?.setBookmark(bookmark);
        this._fuse?.add(bookmark);
        // not storing the change for id changes!
        // if (!disableChanges) {
        //   await this.addChangeEntry(bookmark);
        // }
        break;
      case BookmarkRepositoryState.ContentChanged:
      case BookmarkRepositoryState.NotExists:
        this._fuse?.remove((b) => b.id === bookmark.id);
        this._bookmarks.set(bookmark.id, bookmark);
        this._fuse?.add(bookmark);
        await this._db?.setBookmark(bookmark);
        if (!disableChanges) {
          await this._changes.add(bookmark);
        }
        break;
    }
  }

  async removeBookmark(
    bookmarkId: string,
    disableChanges = false,
  ): Promise<void> {
    if (this._bookmarks.has(bookmarkId)) {
      this._bookmarks.delete(bookmarkId);
      this._fuse?.remove((b) => b.id === bookmarkId);
      await this._db?.removeBookmark(bookmarkId);
      if (!disableChanges) {
        await this._changes.add(bookmarkId);
      }
    }
  }

  get bookmarks(): MapIterator<Bookmark> {
    return this._bookmarks.values();
  }

  getBookmarkRepositoryState(bookmark: Bookmark): BookmarkRepositoryState {
    let state = BookmarkRepositoryState.NotExists;

    const entry = this._bookmarks.get(bookmark.id);
    if (entry) {
      if (entry.hash === bookmark.hash) {
        state = BookmarkRepositoryState.Exists;
      } else {
        state = BookmarkRepositoryState.ContentChanged;
      }
    } else if (this._bookmarks.reverseHas(bookmark.hash)) {
      state = BookmarkRepositoryState.IdChanged;
    }
    return state;
  }

  search(query: string): Bookmark[] {
    return this._fuse?.search(query).map((item) => item.item) ?? [];
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }
}
