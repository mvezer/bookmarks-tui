import { type Bookmark, isFromTuiApp } from "./bookmark";

export class BookmarksRepository {
  private _bookmarks: Map<string, Bookmark> = new Map<string, Bookmark>();
  private _bookmarksHashLookup: Map<string, string> = new Map<string, string>();

  add(bookmark: Bookmark): Bookmark | undefined {
    const hashMatchId = this._bookmarksHashLookup.get(bookmark.hash);
    if (hashMatchId && isFromTuiApp(bookmark)) {
      return;
    }
    if (
      hashMatchId &&
      isFromTuiApp(hashMatchId) &&
      bookmark.id !== hashMatchId
    ) {
      this.delete(hashMatchId);
    }
    this._bookmarks.set(bookmark.id, bookmark);
    this._bookmarksHashLookup.set(bookmark.hash, bookmark.id);
    return bookmark;
  }

  delete(idOrBookmark: string | Bookmark): void {
    const bookmark =
      typeof idOrBookmark === "string"
        ? this._bookmarks.get(idOrBookmark)
        : idOrBookmark;
    if (!bookmark) {
      return;
    }
    const { hash } = bookmark;
    this._bookmarksHashLookup.delete(hash);
    this._bookmarks.delete(bookmark.id);
  }

  getByHash(hash: string): Bookmark | undefined {
    const id = this._bookmarksHashLookup.get(hash);
    if (!id) {
      return undefined;
    }
    return this._bookmarks.get(id);
  }

  getById(id: string): Bookmark | undefined {
    return this._bookmarks.get(id);
  }

  getAll(): Bookmark[] {
    return Array.from(this._bookmarks.values());
  }

  size(): number {
    return this._bookmarks.size;
  }
}
