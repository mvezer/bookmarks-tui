export enum ChromeBookmarkEventChangeKind {
  Add = 'add',
  Update = 'update',
  Remove = 'remove',
}

// this set tells the onBookmarkCreated/Changed/Removed handlers to ignore the bookmark
export class ChromeBookmarkEventIgnoreMap {
  // the set elemens are in bookmarkId_changeKind format
  private _data = new Set<string>();
  private key(bookmarkId: string, changeKind: ChromeBookmarkEventChangeKind) {
    return `${bookmarkId}_${changeKind}`;
  }
  has(bookmarkId: string, changeKind: ChromeBookmarkEventChangeKind) {
    return this._data.has(this.key(bookmarkId, changeKind));
  }

  set(bookmarkId: string, changeKind: ChromeBookmarkEventChangeKind) {
    this._data.add(this.key(bookmarkId, changeKind));
  }

  delete(bookmarkId: string, changeKind: ChromeBookmarkEventChangeKind) {
    this._data.delete(this.key(bookmarkId, changeKind));
  }
  checkAndDelete(
    bookmarkId: string,
    changeKind: ChromeBookmarkEventChangeKind,
  ): boolean {
    if (this.has(bookmarkId, changeKind)) {
      this.delete(bookmarkId, changeKind);
      return true;
    }
    return false;
  }
}
