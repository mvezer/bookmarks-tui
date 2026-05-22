import { readFileSync, writeFileSync } from "fs";
import Fuse from "fuse.js";

const DEFAULT_BOOKMARKS_FILE_PATH =
  process.env.HOME + "/.config/vivaldi/Default/Bookmarks";

const roots = ["bookmark_bar", "other", "synced"];

interface BookmarkEntry {
  name: string;
  description?: string;
  url: string;
}

const getBookmarkEntries = () => {
  const bookmarkEntries: BookmarkEntry[] = [];
  try {
    const bookmarksText = readFileSync(DEFAULT_BOOKMARKS_FILE_PATH, "utf8");
    const bookmarks = JSON.parse(bookmarksText);

    const stack = [];
    for (const root of roots) {
      const r = bookmarks?.roots[root];
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
        if (node?.url) {
          bookmarkEntries.push({
            name: node.name,
            description: node.description || "",
            url: node.url,
          });
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
  return bookmarkEntries;
};

const bookmarkEntries = getBookmarkEntries();
console.log(bookmarkEntries);
const fuse = new Fuse(bookmarkEntries, {
  keys: ["name", "description"],
});

