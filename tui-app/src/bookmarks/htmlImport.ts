import type { BookmarkCreateData } from "@bookmarks-tui/types";
import { readFileSync } from "fs";
import { parse } from "node-html-parser";

export const htmlImport = (filePath: string): BookmarkCreateData[] => {
  const htmlObj = parse(readFileSync(filePath, "utf8"));
  const links = htmlObj.getElementsByTagName("a");
  if (!links) {
    throw new Error("No links found in HTML file");
  }
  return links.map((l) => {
    const url = l.attrs.href || "";
    const title = l.text;

    return {
      dateAdded: l.attrs.add_date ? parseInt(l.attrs.add_date) : undefined,
      title,
      description: l.attrs.description,
      url,
    } as BookmarkCreateData;
  });
};
