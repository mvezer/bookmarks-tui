export const BOOKMARKS_TUI_APP_PREFIX = "ta_";

export interface Bookmark {
  id: string;
  dateAdded?: number;
  description?: string;
  title: string;
  url: string;
  hash: string;
}

export interface BookmarkCreateData {
  dateAdded?: number;
  url: string;
  title: string;
  description?: string;
}

export const isBookmark = (bookmark: unknown): bookmark is Bookmark => {
  return (
    typeof bookmark === "object" &&
    bookmark !== null &&
    "id" in bookmark &&
    typeof bookmark.id === "string" &&
    "title" in bookmark &&
    typeof bookmark.title === "string" &&
    "url" in bookmark &&
    typeof bookmark.url === "string" &&
    "hash" in bookmark &&
    typeof bookmark.hash === "string"
  );
};

export const isFromTuiApp = (idOrBookmark: string | Bookmark): boolean => {
  const id = typeof idOrBookmark === "string" ? idOrBookmark : idOrBookmark.id;
  return id.startsWith(BOOKMARKS_TUI_APP_PREFIX);
};
