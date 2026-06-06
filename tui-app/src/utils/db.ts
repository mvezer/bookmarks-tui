import {
  BookmarkChangeKind,
  type Bookmark,
  type BookmarkChange,
  type BookmarkAddChange,
  type BookmarkRemoveChange,
  type IChangeStorage,
} from '@bookmarks-tui/common';
import { Database } from 'bun:sqlite';

export interface IBookmarkStorage {
  init(): Promise<void>;
  getAllBookmarks(): Promise<Bookmark[]>;
  getBookmark(bookmarkId: string): Promise<Bookmark | undefined>;
  setBookmark(bookmark: Bookmark): Promise<void>;
  removeBookmark(bookmarkId: string): Promise<void>;
}

const BOOKMARKST_ABLE_DDL = `
CREATE TABLE IF NOT EXISTS bookmarks (
	id TEXT(128) NOT NULL,
  modified INTEGER NOT NULL,
	title TEXT(512) NOT NULL,
	hash TEXT(32) NOT NULL,
	url TEXT(512) NOT NULL,
	CONSTRAINT bookmarks_pk PRIMARY KEY (id)
);
`;

const CHANGES_ADD_TABLE_DDL = `CREATE TABLE IF NOT EXISTS changes_add (
	uuid TEXT(36) NOT NULL,
  timestamp INTEGER NOT NULL,
	id TEXT(128) NOT NULL,
  modified INTEGER NOT NULL,
	title TEXT(512) NOT NULL,
	hash TEXT(32) NOT NULL,
	url TEXT(512) NOT NULL,
	CONSTRAINT changes_add_pk PRIMARY KEY (uuid)
);
`;
const CHANGES_REMOVE_TABLE_DDL = `CREATE TABLE IF NOT EXISTS changes_remove (
	uuid TEXT(36) NOT NULL,
  timestamp INTEGER NOT NULL,
	id TEXT(128) NOT NULL,
	CONSTRAINT changes_remove_pk PRIMARY KEY (uuid)
);
`;

const DEFAULT_DB_PATH = process.env.HOME + '/.config/bookmarks/bookmarks.db';

export class Db implements IChangeStorage, IBookmarkStorage {
  private _isInitialized = false;
  private _db: Database;
  constructor(private _dbPath: string = DEFAULT_DB_PATH) {
    this._db = new Database(this._dbPath, { create: true });
  }

  async init(): Promise<void> {
    if (this._isInitialized) {
      return;
    }
    this._db.query(BOOKMARKST_ABLE_DDL).run();
    this._db.query(CHANGES_ADD_TABLE_DDL).run();
    this._db.query(CHANGES_REMOVE_TABLE_DDL).run();
    this._isInitialized = true;
  }

  async getAllBookmarkChanges(): Promise<{ [key: string]: BookmarkChange }> {
    await this.init();

    try {
      const addChanges = this._db
        .query('SELECT * FROM changes_add')
        .all()
        .reduce((acc: { [key: string]: BookmarkChange }, c: any) => {
          const { uuid, timestamp, ...bookmark } = c;
          acc[uuid] = {
            timestamp,
            kind: BookmarkChangeKind.Add,
            ...bookmark,
          } as BookmarkAddChange;
          return acc;
        }, {});
      const removeChanges = this._db
        .query('SELECT * FROM changes_remove')
        .all()
        .reduce((acc: { [key: string]: BookmarkChange }, c: any) => {
          const { uuid, timestamp, id } = c;
          acc[uuid] = {
            timestamp,
            kind: BookmarkChangeKind.Remove,
            id,
          } as BookmarkRemoveChange;
          return acc;
        }, {});
      return Promise.resolve({ ...addChanges, ...removeChanges });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async removeBookmarkChange(changeId: string): Promise<boolean> {
    console.log('deleting change', changeId, ' from db');
    await this.init();
    try {
      const remove_response = this._db
        .query(`DELETE FROM changes_remove WHERE uuid = ?`)
        .get(changeId);
      console.log('remove_response', remove_response);
      const add_response = this._db
        .query(`DELETE FROM changes_add WHERE uuid = ?`)
        .get(changeId);
      console.log('add_response', add_response);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async addBookmarkChange(changes: {
    [key: string]: BookmarkChange;
  }): Promise<void> {
    await this.init();
    try {
      for (const [uuid, change] of Object.entries(changes)) {
        if (change.kind === BookmarkChangeKind.Add) {
          this._db
            .query(
              `INSERT INTO changes_add (uuid, timestamp, id, modified, title, hash, url) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT (uuid) DO UPDATE SET timestamp = ?, id = ?, modified = ?, title = ?, hash = ?, url = ?`,
            )
            .run(
              uuid,
              change.timestamp,
              change.id,
              change.modified,
              change.title,
              change.hash,
              change.url,
              change.timestamp,
              change.id,
              change.modified,
              change.title,
              change.hash,
              change.url,
            );
        } else if (change.kind === BookmarkChangeKind.Remove) {
          this._db
            .query(
              `INSERT INTO changes_remove (uuid, timestamp, id) VALUES (?, ?, ?) ON CONFLICT (uuid) DO UPDATE SET timestamp = ?, id = ?`,
            )
            .run(
              uuid,
              change.timestamp,
              change.id,
              change.timestamp,
              change.id,
            );
        }
        return Promise.resolve();
      }
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    await this.init();
    try {
      return this._db
        .query('SELECT * FROM bookmarks')
        .all()
        .map((b) => b as Bookmark);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getBookmark(bookmarkId: string): Promise<Bookmark | undefined> {
    await this.init();
    try {
      const result = this._db
        .query(`SELECT * FROM bookmarks WHERE id = ?`)
        .get(bookmarkId);
      if (!result) {
        return;
      }
      return result as Bookmark;
    } catch (e) {
      return Promise.reject(e);
    }
  }
  async setBookmark(bookmark: Bookmark): Promise<void> {
    await this.init();
    try {
      this._db
        .query(
          `INSERT INTO bookmarks (id, modified, title, hash, url) VALUES (?, ?, ?, ?, ?) ON CONFLICT (id) DO UPDATE SET modified = ?, title = ?, hash = ?, url = ?`,
        )
        .run(
          bookmark.id,
          bookmark.modified,
          bookmark.title,
          bookmark.hash,
          bookmark.url,
          bookmark.modified,
          bookmark.title,
          bookmark.hash,
          bookmark.url,
        );
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async removeBookmark(bookmarkId: string): Promise<void> {
    await this.init();
    try {
      this._db.query(`DELETE FROM bookmarks WHERE id = ?`).run(bookmarkId);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }
}
