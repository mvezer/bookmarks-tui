import {
  BoxRenderable,
  CliRenderer,
  TextRenderable,
  RGBA,
} from "@opentui/core";
import { type Bookmark } from "@bookmarks-tui/common";

const BG_COLOR_NORMAL = "#00000000";
const BG_COLOR_SELECTED = "#6c6c6c";
const FG_COLOR_NORMAL = "#bdbdbd";
const FG_COLOR_SELECTED = "#00d4c0";

export class ResultItem extends BoxRenderable {
  private _selected = false;
  private _text: TextRenderable;
  constructor(
    renderer: CliRenderer,
    private _bookmark: Bookmark,
  ) {
    super(renderer, {
      id: `result-item-${_bookmark.id}`,
      width: "100%",
      height: 1,
    });
    this._text = new TextRenderable(renderer, {
      content: _bookmark.title,
    });
    this.add(this._text);
    this._applySelected();
  }
  get bookmark(): Bookmark {
    return this._bookmark;
  }

  private _applySelected() {
    this._backgroundColor = RGBA.fromHex(
      this._selected ? BG_COLOR_SELECTED : BG_COLOR_NORMAL,
    );
    this._text.fg = RGBA.fromHex(
      this._selected ? FG_COLOR_SELECTED : FG_COLOR_NORMAL,
    );
  }

  set selected(value: boolean) {
    this._selected = value;
    this._applySelected();
  }

  get selected(): boolean {
    return this._selected;
  }
}
