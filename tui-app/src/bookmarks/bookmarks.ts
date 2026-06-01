import Fuse from "fuse.js";
import { htmlImport } from "./htmlImport";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { EventBus, BookmarkEvents } from "../events";
import {
  type Bookmark,
  type BookmarkSync,
  type BookmarkCreateData,
  BookmarksRepository,
  isBookmark,
  BOOKMARKS_TUI_APP_PREFIX,
  isFromTuiApp,
  BookmarkSyncKind,
  type BookmarkAddSync,
  type BookmarkRemoveSync,
  isBookmarkSync,
  createAddBookmarkSync,
  createRemoveBookmarkSync,
  createBookmarkHash,
} from "@bookmarks-tui/common";

const BOOKMARKS_FILE_PATH =
  process.env.HOME + "/.config/bookmarks/bookmarks.json";

const TUI_IDS_START = 100000;

export class Bookmarks {
  private _bookmarkRepository: BookmarksRepository = new BookmarksRepository();
  private _fuse: Fuse<Bookmark> | undefined;
  private _maxId = TUI_IDS_START;
  private _syncItems: Map<string, BookmarkSync> = new Map<
    string,
    BookmarkSync
  >();

  constructor(private _bookmarksFilePath: string = BOOKMARKS_FILE_PATH) {
    this._fuse = new Fuse<Bookmark>([], { keys: ["title"] });
  }

  search(query: string): Bookmark[] {
    if (!this._fuse) {
      throw new Error("Fuse not initialized");
    }
    return this._fuse.search(query).map((r) => r.item);
  }

  load(): void {
    if (existsSync(this._bookmarksFilePath)) {
      const { bookmarks, sync } = JSON.parse(
        readFileSync(BOOKMARKS_FILE_PATH, "utf8"),
      );
      bookmarks.forEach((b: Bookmark) => {
        if (!isBookmark(b)) {
          throw new Error("Invalid bookmark");
        }
        this.add(b);
      });
      Object.entries<BookmarkSync>(sync).forEach(([id, s]) => {
        if (!isBookmarkSync(s)) {
          throw new Error("Invalid bookmark sync");
        }
        this._syncItems.set(
          id,
          s.kind === BookmarkSyncKind.add
            ? (s as BookmarkAddSync)
            : (s as BookmarkRemoveSync),
        );
      });
      console.log(`Loaded ${bookmarks.length} bookmarks`);
    }
  }

  save(): void {
    console.log("Saving bookmarks to DB");
    writeFileSync(
      this._bookmarksFilePath,
      JSON.stringify({
        bookmarks: this._bookmarkRepository.getAll(),
        sync: this._syncItems.entries().reduce(
          (acc, [id, bookmarkSync]) => {
            acc[id] = bookmarkSync;
            return acc;
          },
          {} as Record<string, BookmarkSync>,
        ),
      }),
    );
  }

  add(bookmark: Bookmark, sync = false): void {
    if (!!this._bookmarkRepository.add(bookmark)) {
      this._fuse?.add(bookmark);
      // if the bookmark was created in the tui, determine the new max id
      if (isFromTuiApp(bookmark)) {
        this._maxId = Math.max(
          parseInt(bookmark.id.slice(BOOKMARKS_TUI_APP_PREFIX.length)),
          this._maxId,
        );
      }
      if (sync) {
        const syncData = createAddBookmarkSync(bookmark);
        this._syncItems.set(syncData.uuid, syncData);
      }
    }
  }

  delete(toDelete: string | Bookmark, sync = false): void {
    const id = typeof toDelete === "string" ? toDelete : toDelete.id;
    this._fuse?.remove((b) => b.id === id);
    this._bookmarkRepository.delete(id);
    if (sync) {
      const syncData = createRemoveBookmarkSync(id);
      this._syncItems.set(syncData.uuid, syncData);
    }
  }

  sync(syncData: BookmarkSync[]): string[] {
    const synced: string[] = [];
    for (const sync of syncData) {
      if (isBookmarkSync(sync)) {
        if (sync.kind === BookmarkSyncKind.add) {
          this.add(sync.bookmark);
        } else if (sync.kind === BookmarkSyncKind.remove) {
          this.delete(sync.id);
        }
        synced.push(sync.uuid);
      } else {
        console.warn(`Invalid bookmark sync: ${sync}`);
      }
    }
    EventBus.emit(BookmarkEvents.syncedBookmarks, synced);
    return synced;
  }

  get syncItems(): BookmarkSync[] {
    return Array.from(this._syncItems.values());
  }

  confirmSync(syncedIds: string[]): void {
    syncedIds.forEach((id) => {
      this._syncItems.delete(id);
    });
  }

  create(bookmarkCreateData: BookmarkCreateData): Bookmark {
    const { title, url, description, dateAdded } = bookmarkCreateData;
    return {
      dateAdded: dateAdded ?? Date.now(),
      id: this.nextId,
      title,
      description,
      url,
      hash: createBookmarkHash({ title, url }),
    };
  }

  importFromHtml(filePath: string): void {
    const newBookmarks = htmlImport(filePath);
    if (newBookmarks.length === 0) {
      return;
    }
    newBookmarks.map(this.create.bind(this)).forEach((b) => this.add(b, true));

    this.save();
  }

  get nextId(): string {
    return `${BOOKMARKS_TUI_APP_PREFIX}${++this._maxId}`;
  }

  getAll(): Bookmark[] {
    return this._bookmarkRepository.getAll();
  }
}
