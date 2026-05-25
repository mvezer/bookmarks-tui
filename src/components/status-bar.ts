import { type BookmarkEntry } from "../bookmarks/types";
import { BoxRenderable, CliRenderer, TextRenderable } from "@opentui/core";

export class StatusBar extends BoxRenderable {
  private _statusText: TextRenderable;
  constructor(renderer: CliRenderer) {
    super(renderer, {
      id: "status-bar",
      width: "100%",
      height: 2,
      bottom: 0,
      border: ["top"],
    });

    this._statusText = new TextRenderable(renderer, {
      content: "No bookmarks",
      width: "100%",
      height: 1,
    });
    this.add(this._statusText);
  }

  set currentBookmark(bookmarkEntry: BookmarkEntry | undefined) {
    if (bookmarkEntry) {
      this._statusText.content = bookmarkEntry.url;
      console.log(bookmarkEntry.url);
    } else {
      this._statusText.content = "-";
    }
  }
}
