import { createBookmarkHash } from './hash';
import { v4 as uuidv4 } from 'uuid';

export interface BookmarkCreateData {
  uid?: string;
  modified?: number;
  url: string;
  title: string;
}

export interface Bookmark extends BookmarkCreateData {
  uid: string;
  modified: number;
  hash: string;
}

export const isBookmark = (bookmark: unknown): bookmark is Bookmark => {
  return (
    typeof bookmark === 'object' &&
    bookmark !== null &&
    'uid' in bookmark &&
    typeof bookmark.uid === 'string' &&
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

export const createBookmark = (
  bookmarkCreateData: BookmarkCreateData,
): Bookmark => {
  const { uid, title, url, modified } = bookmarkCreateData;
  return {
    uid: uid ?? uuidv4(),
    title,
    url,
    modified: modified ?? Date.now(),
    hash: createBookmarkHash({ title, url }),
  };
};
