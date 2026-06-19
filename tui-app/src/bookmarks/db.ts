import { type Bookmark } from '@bookmarks-tui/common/bookmarks';
import type { SyncData } from '@bookmarks-tui/common/sync';
import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const BOOKMARKS_DDL = `
CREATE TABLE IF NOT EXISTS bookmarks (
	uid TEXT(36) NOT NULL,
	title TEXT(1024) NOT NULL,
	url TEXT(1024) NOT NULL,
	hash TEXT(32) NOT NULL,
	modified INTEGER NOT NULL,
	deleted INTEGER NOT NULL,
	PRIMARY KEY (uid)
);`;

const SYNC_DDL = `CREATE TABLE IF NOT EXISTS sync (
	bookmark_uid TEXT,
  client_id TEXT(36) NOT NULL,
  "timestamp" INTEGER NOT NULL,
	FOREIGN KEY (bookmark_uid) REFERENCES bookmarks(uid),
  PRIMARY KEY (bookmark_uid, client_id)
);`;

export class Db {
  private _isInitialized = false;
  private _db: Database;
  constructor(dbPath: string) {
    mkdirSync(dirname(dbPath), { recursive: true });
    this._db = new Database(dbPath, { create: true });
  }

  init(): void {
    if (this._isInitialized) {
      return;
    }
    this._db.query(BOOKMARKS_DDL).run();
    this._db.query(SYNC_DDL).run();
    this._isInitialized = true;
  }

  getAllBookmarks(): Bookmark[] {
    return this._db
      .query('SELECT * FROM bookmarks WHERE deleted = 0')
      .all()
      .map((b) => b as Bookmark);
  }

  getBookmark(uid: string): Bookmark | undefined {
    const result = this._db
      .query(`SELECT * FROM bookmarks WHERE uid = ?`)
      .get(uid);
    if (!result) {
      return undefined;
    }
    return result as Bookmark;
  }

  setBookmark(bookmark: Bookmark): void {
    this._db
      .query(
        `INSERT INTO bookmarks (uid, title, url, hash, modified, deleted) VALUES (?, ?, ?, ?, ?, 0) ON CONFLICT (uid) DO UPDATE SET title = ?, url = ?, hash = ?, modified = ?`,
      )
      .run(
        // insest values
        bookmark.uid,
        bookmark.title,
        bookmark.url,
        bookmark.hash,
        bookmark.modified,
        // update values
        bookmark.title,
        bookmark.url,
        bookmark.hash,
        bookmark.modified,
      );
  }

  removeBookmark(uid: string): void {
    this.init();
    this._db
      .query(`UPDATE bookmarks SET deleted = 1, modified = ? WHERE uid = ?`)
      .run(Date.now(), uid);
  }

  getSyncData(clientId: string): SyncData {
    this.init();
    // this is the tricky part. We need to get all the bookmarks that do not have corresponding sync entry where the client_id and the bookmmark uid match or the latest if there are mathcing sync etries, the latest matching sync entry timestamp must be lower then the bookmark modified timestamp
    const result = this._db
      .query(
        `SELECT bookmarks.*
            FROM bookmarks LEFT JOIN sync
          ON bookmarks.uid = sync.bookmark_uid
            WHERE (sync.bookmark_uid IS NULL OR sync.timestamp < bookmarks.modified)
        `,
      )

      .all(clientId) as (Bookmark & { deleted: number })[];
    return result.reduce((syncData, bookmark) => {
      if (bookmark.deleted == 1) {
        if (syncData.removed) {
          syncData.removed.push(bookmark.uid);
        } else {
          syncData.removed = [bookmark.uid];
        }
      } else {
        if (syncData.changed) {
          syncData.changed.push(bookmark);
        } else {
          syncData.changed = [bookmark];
        }
      }
      return syncData;
    }, {} as SyncData);
  }

  confirmSync(uid: string, clientId: string): void {
    this.init();
    const now = Date.now();
    this._db
      .query(
        `INSERT INTO sync (bookmark_uid, client_id, timestamp) VALUES (?, ?, ?) ON CONFLICT (bookmark_uid, client_id) DO UPDATE SET timestamp = ?`,
      )
      .run(uid, clientId, now, now);
  }

  get isInitialized(): boolean {
    return this._isInitialized;
  }
}
