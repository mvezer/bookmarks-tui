import { EventEmitter } from "node:events";

export enum KeymapEvents {
  moveUp = "moveUp",
  moveDown = "moveDown",
  quit = "quit",
  toggleConsole = "toggleConsole",
  halfPageUp = "halfPageUp",
  halfPageDown = "halfPageDown",
  pageDown = "pageDown",
  pageUp = "pageUp",
  enter = "enter",
  delete = "delete",
}

export enum BookmarkEvents {
  selectBookmark = "selectBookmark",
  searchBookmark = "searchBookmark",
}

class Events extends EventEmitter {
  constructor() {
    super();
  }

  override emit(
    event: KeymapEvents | BookmarkEvents,
    ...args: unknown[]
  ): boolean {
    return super.emit(event, ...args);
  }
}

export const EventBus = new Events();
