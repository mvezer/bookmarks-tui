import { EventEmitter } from 'node:events';

export enum TUIEvents {
  BookmarkActionRequest = 'BookmarkActionRequest',
  SearchQueryChanged = 'searchQueryChanged',
  BookmarkDeleteRequest = 'bookmarkDeleteRequest',
  BookmarkSelected = 'bookmarkSelected',
}

export class TUIEventBus extends EventEmitter {
  private static _instance: TUIEventBus;

  private constructor() {
    super();
  }

  static get instance(): TUIEventBus {
    if (!TUIEventBus._instance) {
      TUIEventBus._instance = new TUIEventBus();
    }
    return TUIEventBus._instance;
  }
}
