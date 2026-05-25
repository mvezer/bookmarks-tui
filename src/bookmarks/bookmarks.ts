import Fuse from "fuse.js";
import { type BookmarkEntry } from "./types";
import { chromeImport } from "./importers/chrome";
import { htmlImport } from "./importers/html";
import { readFileSync, writeFileSync, existsSync } from "fs";
// import { Database } from "bun:sqlite"; // TODO: add sqlite for firefox import

const BOOKMARKS_FILE_PATH =
  process.env.HOME + "/.config/bookmarks/bookmarks.json";

export class Bookmarks {
  private _bookmarks: BookmarkEntry[] = [];
  private _fuse: Fuse<BookmarkEntry> | undefined;

  constructor(private _bookmarksFilePath: string = BOOKMARKS_FILE_PATH) {}

  updateFuse() {
    this._fuse = new Fuse(this._bookmarks, {
      keys: ["name"],
    });
  }

  get bookmarkEntries(): BookmarkEntry[] {
    return this._bookmarks;
  }

  search(query: string): BookmarkEntry[] {
    if (!this._fuse) {
      throw new Error("Fuse not initialized");
    }
    return this._fuse.search(query).map((r) => r.item);
  }

  load(): void {
    if (existsSync(this._bookmarksFilePath)) {
      this._bookmarks = JSON.parse(readFileSync(BOOKMARKS_FILE_PATH, "utf8"));
    }
    console.log(`Loaded ${this._bookmarks.length} bookmarks`);
    this.updateFuse();
  }

  save(): void {
    console.log("Saving bookmarks to DB");
    writeFileSync(this._bookmarksFilePath, JSON.stringify(this._bookmarks));
  }

  isBookmarkExists(bookmarkEntry: BookmarkEntry): boolean {
    const found = this._bookmarks.find((b) => {
      return (
        b.guid === bookmarkEntry.guid ||
        (b.name == bookmarkEntry.name && b.url == bookmarkEntry.url)
      );
    });
    return found !== undefined;
  }

  mergeBookmarks(newEntries: BookmarkEntry[]): BookmarkEntry[] {
    const newBookmarks = newEntries.filter((b) => {
      return !this.isBookmarkExists(b);
    });
    this._bookmarks.push(...newBookmarks);
    console.log(`Merged ${newBookmarks.length} new bookmarks`);
    return newBookmarks;
  }

  importFromChrome(filePath?: string): void {
    // TODO: merge imported bookmarks with existing ones
    const newBookmarks = this.mergeBookmarks(chromeImport(filePath));
    if (newBookmarks.length === 0) {
      return;
    }
    this.save();
  }

  importFromHtml(filePath: string): void {
    const newBookmarks = this.mergeBookmarks(htmlImport(filePath));
    if (newBookmarks.length === 0) {
      return;
    }
    this.save();
  }
}
