import { type BookmarkEntry } from "../types";
import { readFileSync } from "fs";
import { parse } from "node-html-parser";
import { v4 as uuidv4 } from "uuid";

export const htmlImport = (filePath: string): BookmarkEntry[] => {
  const htmlObj = parse(readFileSync(filePath, "utf8"));
  const links = htmlObj.getElementsByTagName("a");
  if (!links) {
    throw new Error("No links found in HTML file");
  }
  return links.map((l) => {
    return {
      date_added: l.attrs.add_date,
      date_last_used: "",
      guid: uuidv4(),
      id: "",
      meta_info: {
        Description: l.attrs.description || "",
        Thumbnail: l.attrs.icon || "",
      },
      type: "url",
      name: l.text,
      description: l.attrs.description || "",
      url: l.attrs.href,
    } as BookmarkEntry;
  });
};
