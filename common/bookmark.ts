import { BOOKMARKS_TUI_APP_ID_PREFIX } from './constants';
import { createBookmarkHash } from './hash';
import { v4 as uuidv4 } from 'uuid';

export interface BookmarkCreateData {
  id?: string;
  modified?: number;
  url: string;
  title: string;
}
export interface Bookmark extends BookmarkCreateData {
  id: string;
  modified: number;
  hash: string;
}

export enum BookmarkChangeKind {
  Add = 'add',
  Remove = 'remove',
}

export interface BookmarkRemoveChange {
  kind: BookmarkChangeKind.Remove;
  timestamp: number;
  id: string;
}

export interface BookmarkAddChange extends Bookmark {
  kind: BookmarkChangeKind.Add;
  timestamp: number;
  // only the connector sets this, when the bookmark was created in the tui and
  // the connector creates the bookmark in the browser and it syncs back the new id to the tui
  oldId?: string;
}

export type BookmarkChange = BookmarkRemoveChange | BookmarkAddChange;

export const isBookmark = (bookmark: unknown): bookmark is Bookmark => {
  return (
    typeof bookmark === 'object' &&
    bookmark !== null &&
    'id' in bookmark &&
    typeof bookmark.id === 'string' &&
    'modified' in bookmark &&
    typeof bookmark.modified === 'number' &&
    'title' in bookmark &&
    typeof bookmark.title === 'string' &&
    'url' in bookmark &&
    typeof bookmark.url === 'string' &&
    'hash' in bookmark &&
    typeof bookmark.hash === 'string'
  );
};

export const isBookmarkAddChange = (
  change: unknown,
): change is BookmarkAddChange => {
  return (
    isBookmark(change) &&
    'kind' in change &&
    change.kind === BookmarkChangeKind.Add &&
    'timestamp' in change &&
    typeof change.timestamp === 'number'
  );
};

export const isBookmarkRemoveChange = (
  change: unknown,
): change is BookmarkRemoveChange => {
  return (
    'kind' in (change as BookmarkRemoveChange) &&
    (change as BookmarkRemoveChange).kind === BookmarkChangeKind.Remove &&
    'timestamp' in (change as BookmarkRemoveChange) &&
    typeof (change as BookmarkRemoveChange).timestamp === 'number' &&
    'id' in (change as BookmarkRemoveChange) &&
    typeof (change as BookmarkRemoveChange).id === 'string'
  );
};

export const isBoookmarkChange = (
  change: unknown,
): change is BookmarkChange => {
  return isBookmarkAddChange(change) || isBookmarkRemoveChange(change);
};

export const isFromTuiApp = (idOrBookmark: string | Bookmark): boolean => {
  const id = typeof idOrBookmark === 'string' ? idOrBookmark : idOrBookmark.id;
  return id.startsWith(BOOKMARKS_TUI_APP_ID_PREFIX);
};

export const createBookmark = (
  bookmarkCreateData: BookmarkCreateData,
): Bookmark => {
  const { id, title, url, modified } = bookmarkCreateData;
  return {
    id: id ?? `${BOOKMARKS_TUI_APP_ID_PREFIX}${uuidv4()}`,
    title,
    url,
    modified: modified ?? Date.now(),
    hash: createBookmarkHash({ title, url }),
  };
};
