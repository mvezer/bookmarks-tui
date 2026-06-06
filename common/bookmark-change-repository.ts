import {
  Bookmark,
  BookmarkChange,
  BookmarkAddChange,
  BookmarkRemoveChange,
  ReverseLookupFieldMap,
  BookmarkChangeKind,
} from '@bookmarks-tui/common';
import { v4 as uuidv4 } from 'uuid';

export interface IChangeStorage {
  init(): Promise<void>;
  getAllBookmarkChanges(): Promise<{ [key: string]: BookmarkChange }>;
  removeBookmarkChange(changeId: string): Promise<boolean>;
  addBookmarkChange(change: { [key: string]: BookmarkChange }): Promise<void>;
}

// export type ChangeEntry = AddChangeEntry | RemoveChangeEntry;
// export type StorageEntry = StateEntry | ChangeEntry;

export class BookmarkChangeRepository {
  private _changeMap = new ReverseLookupFieldMap<string, BookmarkChange, 'id'>(
    'id',
  );
  private _isInitialized = false;

  constructor(private _db?: IChangeStorage) {}

  async init(): Promise<void> {
    if (this._isInitialized) {
      return;
    }
    if (this._db) {
      const bookmarks = await this._db.getAllBookmarkChanges();
      this._changeMap = new ReverseLookupFieldMap<string, BookmarkChange, 'id'>(
        'id',
        Object.entries(bookmarks),
      );
    }
    this._isInitialized = true;
  }

  async add(idOrBookmark: string | Bookmark): Promise<void> {
    const id =
      typeof idOrBookmark === 'string' ? idOrBookmark : idOrBookmark.id;
    const existingChangeId = this._changeMap.reverseGetKey(id);
    if (existingChangeId) {
      await this._db?.removeBookmarkChange(existingChangeId);
      this._changeMap.delete(existingChangeId);
    }
    const changeId = uuidv4();
    const timestamp = Date.now();
    const newChange: BookmarkChange =
      typeof idOrBookmark === 'string'
        ? ({
            kind: BookmarkChangeKind.Remove,
            timestamp,
            id: idOrBookmark,
          } as BookmarkRemoveChange)
        : ({
            kind: BookmarkChangeKind.Add,
            timestamp,
            ...idOrBookmark,
          } as BookmarkAddChange);
    await this._db?.addBookmarkChange({ [changeId]: newChange });
    this._changeMap.set(changeId, newChange);
  }

  async delete(bookmarkChangeId: string): Promise<boolean> {
    this._changeMap.delete(bookmarkChangeId);
    await this._db?.removeBookmarkChange(bookmarkChangeId);
    return true;
  }

  getAllchanges(): MapIterator<[string, BookmarkChange]> {
    return this._changeMap.entries();
  }

  get size(): number {
    return this._changeMap.size;
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }
}
