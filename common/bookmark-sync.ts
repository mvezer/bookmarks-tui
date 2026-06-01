import { type Bookmark, isBookmark } from "./bookmark.ts";
import { v4 as uuidv4 } from "uuid";

export enum BookmarkSyncKind {
  add = "add",
  remove = "remove",
}
export interface BookmarkAddSync {
  uuid: string;
  kind: BookmarkSyncKind.add;
  bookmark: Bookmark;
}
export interface BookmarkRemoveSync {
  uuid: string;
  kind: BookmarkSyncKind.remove;
  id: string;
}

export type BookmarkSync = BookmarkAddSync | BookmarkRemoveSync;

export const createAddBookmarkSync = (bookmark: Bookmark): BookmarkAddSync => {
  return { uuid: uuidv4(), kind: BookmarkSyncKind.add, bookmark };
};
export const createRemoveBookmarkSync = (id: string): BookmarkRemoveSync => {
  return { uuid: uuidv4(), kind: BookmarkSyncKind.remove, id };
};

export const isBookmarkSync = (
  bookmarkSync: unknown,
): bookmarkSync is BookmarkSync => {
  if (!bookmarkSync) return false;
  return (
    typeof bookmarkSync === "object" &&
    typeof (bookmarkSync as BookmarkSync).uuid === "string" &&
    (bookmarkSync as BookmarkSync).uuid.length > 0 &&
    typeof (bookmarkSync as BookmarkSync).kind === "string" &&
    (bookmarkSync as BookmarkSync).kind.length > 0 &&
    (bookmarkSync as BookmarkSync).kind in BookmarkSyncKind &&
    (((bookmarkSync as BookmarkSync).kind === BookmarkSyncKind.add &&
      (bookmarkSync as BookmarkAddSync).bookmark !== undefined &&
      isBookmark((bookmarkSync as BookmarkAddSync).bookmark)) ||
      ((bookmarkSync as BookmarkSync).kind === BookmarkSyncKind.remove &&
        (bookmarkSync as BookmarkRemoveSync).id !== undefined &&
        typeof (bookmarkSync as BookmarkRemoveSync).id === "string" &&
        (bookmarkSync as BookmarkRemoveSync).id.length > 0))
  );
};
