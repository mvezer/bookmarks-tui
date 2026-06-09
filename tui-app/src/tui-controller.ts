import {
  type BookmarkChange,
  type Bookmark,
  BookmarkChangeRepository,
  BookmarkChangeKind,
  createBookmark,
} from '@bookmarks-tui/common';
import { BookmarkRepository } from './bookmarks/bookmark-repository';
import Fuse from 'fuse.js';
import { Db } from './bookmarks/db';
import { TUIEventBus, TUIEvents } from './tui/tui-events';

import { openUrl } from './utils/browser';
import { TUI } from './tui';

import { Keymap, KeymapEvents } from './tui/keymap';
import { createCliRenderer, ConsolePosition, CliRenderer } from '@opentui/core';
import { type IHttpServerHandlers, startHttpServer } from './utils/http-server';
import type { Config } from './config';
import { openInEditor } from './utils/editor';
import { yesNoDialog } from './tui/components/yesno-dialog';
import { type ColorScheme } from './colorscheme';

export class TUIController {
  private _fuse: Fuse<Bookmark>;
  private _db: Db;
  private _bookmarkChangeRepository: BookmarkChangeRepository;
  private _bookmarkRepository: BookmarkRepository;
  private _tui: TUI | undefined;
  private _renderer: CliRenderer | undefined;
  private _colorScheme: ColorScheme;

  constructor(private _config: Config) {
    this._db = new Db();
    this._fuse = new Fuse<Bookmark>([], {
      keys: ['title'],
      includeScore: false,
    });
    this._bookmarkChangeRepository = new BookmarkChangeRepository(this._db);
    this._bookmarkRepository = new BookmarkRepository(
      this._bookmarkChangeRepository,
      this._db,
      this._fuse,
    );

    this._colorScheme =
      _config.customColorSchemes[this._config.general.colorScheme]!;
  }
  private async createRenderer(): Promise<CliRenderer> {
    this._renderer = await createCliRenderer({
      onDestroy: () => process.exit(0),
      consoleOptions: {
        position: ConsolePosition.BOTTOM, // Position on screen
        sizePercent: 30, // Size as percentage of terminal
        colorInfo: '#00FFFF', // Color for console.info
        colorWarn: '#FFFF00', // Color for console.warn
        colorError: '#FF0000', // Color for console.error
        startInDebugMode: false, // Show file/line info in logs
      },
    });
    return this._renderer;
  }

  private startHttpServer(): void {
    startHttpServer({
      onStatus: () => 'ok',
      onSyncReceived: async (
        changes: [string, BookmarkChange][],
      ): Promise<string[]> => {
        const processedChangeIds: string[] = [];
        for (const [changeId, change] of changes) {
          const { kind, timestamp, ...idOrBookmark } = change;
          try {
            if (kind === BookmarkChangeKind.Add) {
              await this._bookmarkRepository.setBookmark.bind(
                this._bookmarkRepository,
              )(idOrBookmark as Bookmark, true);
            } else if (kind === BookmarkChangeKind.Remove) {
              await this._bookmarkRepository.removeBookmark.bind(
                this._bookmarkRepository,
              )(idOrBookmark.id, true);
            }
            processedChangeIds.push(changeId);
          } catch (error) {
            console.error(error);
          }
        }
        if (processedChangeIds.length > 0) {
          this._tui?.resetSearch();
          this.updateSearchResults();
        }
        return processedChangeIds;
      },
      onSyncRequested: () => {
        return Array.from(
          this._bookmarkChangeRepository
            .getAllchanges()
            .map(([changeId, change]) => [changeId, change]),
        );
      },
      onSyncConfirmed: async (keys: string[]): Promise<void> => {
        await Promise.all(
          keys.map((k) => this._bookmarkChangeRepository.delete(k)),
        );
      },
    } as IHttpServerHandlers);
  }

  private updateSearchResults(): void {
    this._tui!.bookmarks = this._bookmarkRepository.search(
      this._tui!.searchQuery,
    );
  }

  async deleteBookmark(bookmark: Bookmark): Promise<void> {
    yesNoDialog(
      this._tui!.renderer,
      this._colorScheme,
      `Are you sure you want to delete "${bookmark.title}"? (${bookmark.url})`,
      () => {
        TUIEventBus.instance.emit(TUIEvents.BookmarkDeleteRequest, bookmark);
      },
      () => {},
    );
  }

  async editBookmark(bookmark: Bookmark): Promise<void> {
    try {
      this._renderer?.suspend();
      const { title, url } = await openInEditor(
        bookmark,
        this._config.general.editor,
      );
      const editedBookmark = createBookmark({
        ...bookmark,
        title,
        url,
        modified: Date.now(),
      });
      await this._bookmarkRepository.setBookmark(editedBookmark);
      this.updateSearchResults();
    } catch (e) {
      console.error(e);
    } finally {
      this._renderer?.resume();
    }
  }

  async newBookmark(): Promise<void> {
    try {
      this._renderer?.suspend();
      const { title, url } = await openInEditor(
        undefined,
        this._config.general.editor,
      );
      await this._bookmarkRepository.setBookmark(
        createBookmark({ title, url }),
      );
      this.updateSearchResults();
    } catch (e) {
      console.error(e);
    } finally {
      this._renderer?.resume();
    }
  }

  async init(): Promise<void> {
    await this._db.init();
    await this._bookmarkChangeRepository.init();
    await this._bookmarkRepository.init();

    const renderer = await this.createRenderer();
    Keymap.init(renderer, this._config.keymap);

    this._tui = new TUI(
      renderer,
      this._config.customColorSchemes[this._config.general.colorScheme]!,
    );
    this.updateSearchResults();

    TUIEventBus.instance.on(
      TUIEvents.SearchQueryChanged,
      this.updateSearchResults.bind(this),
    );

    TUIEventBus.instance.on(
      TUIEvents.BookmarkActionRequest,
      (bookmark: Bookmark) => {
        openUrl(bookmark.url);
      },
    );

    TUIEventBus.instance.on(
      TUIEvents.BookmarkDeleteRequest,
      async (bookmark: Bookmark) => {
        await this._bookmarkRepository.removeBookmark(bookmark.id);
        this.updateSearchResults();
      },
    );

    Keymap.instance.on(KeymapEvents.quit, () => {
      this._renderer?.destroy();
    });

    Keymap.instance.on(KeymapEvents.deleteBookmark, () => {
      const selectedBookmark = this._tui?.selectedBookmark;
      if (selectedBookmark === undefined) {
        return;
      }
      this.deleteBookmark(selectedBookmark);
    });

    Keymap.instance.on(KeymapEvents.editBookmark, () => {
      const selectedBookmark = this._tui?.selectedBookmark;
      if (selectedBookmark === undefined) {
        return;
      }
      this.editBookmark(selectedBookmark);
    });

    Keymap.instance.on(KeymapEvents.newBookmark, () => {
      this.newBookmark();
    });

    if (!this._config.general.disableHttpServer) {
      this.startHttpServer();
    }
  }
}
