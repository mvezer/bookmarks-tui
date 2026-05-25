import { type BookmarkEntry } from "../types";
import { readFileSync } from "fs";

const ROOTS = ["bookmark_bar", "other", "synced"];

const DEFAULT_BOOKMARKS_FILE_PATH =
  process.env.HOME + "/.config/vivaldi/Default/Bookmarks";

// TODO: detect file path when not provided
export const chromeImport = (
  filePath: string = DEFAULT_BOOKMARKS_FILE_PATH,
): BookmarkEntry[] => {
  // load bookmarks JSON from file
  let rawBookmarks: any;
  try {
    rawBookmarks = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error('Error reading file "' + filePath + '": ' + error);
  }

  // parse bookmarks JSON
  const bookmarkEntries: BookmarkEntry[] = [];
  try {
    const stack = [];
    for (const root of ROOTS) {
      const r = rawBookmarks?.roots[root];
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
};
