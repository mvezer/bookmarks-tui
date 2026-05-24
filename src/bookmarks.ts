import Fuse from "fuse.js";
import { readFileSync, writeFileSync } from "fs";

export interface BookmarkEntry {
  date_added: string;
  date_last_used: string;
  guid: string;
  id: string;
  meta_info?: {
    Description?: string;
    Thumbnail?: string;
    power_bookmark_meta?: string;
  };
  type: string;
  name: string;
  description?: string;
  url: string;
}

const DEFAULT_BOOKMARKS_FILE_PATH =
  process.env.HOME + "/.config/vivaldi/Default/Bookmarks";

const roots = ["bookmark_bar", "other", "synced"];

export class Bookmarks {
  private _rawBookmarks: any;
  private _bookmarks: BookmarkEntry[] = [];
  private _fuse: Fuse<BookmarkEntry> | undefined;

  constructor(
    private _bookmarksFilePath: string = DEFAULT_BOOKMARKS_FILE_PATH,
  ) {}

  load(): BookmarkEntry[] {
    try {
      this._rawBookmarks = JSON.parse(
        readFileSync(this._bookmarksFilePath, "utf8"),
      );
    } catch (error) {
      console.error(
        'Error reading file "' + this._bookmarksFilePath + '": ' + error,
      );
    }
    this._bookmarks = this.parseBookmarks();
    this._fuse = new Fuse(this._bookmarks, {
      keys: ["name"],
    });
    return this._bookmarks;
  }
  save(): void {
    try {
      writeFileSync(
        this._bookmarksFilePath,
        JSON.stringify(this._rawBookmarks),
      );
    } catch (error) {
      console.error(
        'Error writing file "' + this._bookmarksFilePath + '": ' + error,
      );
    }
  }
  parseBookmarks(): BookmarkEntry[] {
    const bookmarkEntries: BookmarkEntry[] = [];
    try {
      const stack = [];
      for (const root of roots) {
        const r = this._rawBookmarks?.roots[root];
        if (!!r) {
          stack.push(r);
        }
      }
      while (stack.length > 0) {
        const node = stack.pop();
        if (node?.children) {
          for (const child of node.children) {
            stack.push(child);
          }
        } else {
          if (node.type === "url" && node?.url) {
            bookmarkEntries.push(node as BookmarkEntry);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
    return bookmarkEntries;
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
}
