import { type Bookmark, createBookmark } from '@bookmarks-tui/common/bookmarks';
import { type SyncData } from '@bookmarks-tui/common/sync';
import { createBookmarkHash } from '@bookmarks-tui/common/hash';
import { BookmarkRepository } from './bookmarks/bookmark-repository';
import { Db } from './bookmarks/db';
import { TUIEventBus, TUIEvents } from './tui/tui-events';

import { openUrl } from './utils/browser';
import { TUI } from './tui';

import { Keymap, KeymapEvents } from './tui/keymap';
import { createCliRenderer, ConsolePosition, CliRenderer } from '@opentui/core';
import { type IHttpServerHandlers, startHttpServer } from './utils/http-server';
import type { Config } from './config/types';
import { openInEditor } from './utils/editor';
import { deleteDialog } from './tui/components/delete-dialog';
import { type ColorScheme } from './colorscheme';
import { infoToast } from './tui/components/info-toast';
import { errorToast } from './tui/components/error-toast';

export class TUIController {
  private _db: Db;
  private _bookmarkRepository: BookmarkRepository;
  private _tui: TUI | undefined;
  private _renderer: CliRenderer | undefined;
  private _colorScheme: ColorScheme;

  constructor(private _config: Config) {
    this._db = new Db(_config.general.dbPath);
    this._bookmarkRepository = new BookmarkRepository(this._db);

    this._colorScheme = _config.colorSchemes[this._config.general.colorScheme]!;
  }
  private async createRenderer(): Promise<CliRenderer> {
    this._renderer = await createCliRenderer({
      onDestroy: () => process.exit(0),
      consoleOptions: {
        position: ConsolePosition.BOTTOM, // Position on screen
        backgroundColor: '#000000AA',
        sizePercent: 30, // Size as percentage of terminal
        colorInfo: '#00FFFF', // Color for console.info
        colorWarn: '#FFFF00', // Color for console.warn
        colorError: '#FF0000', // Color for console.error
        startInDebugMode: false, // Show file/line info in logs
      },
    });
    return this._renderer;
  }

  private sync(syncData: SyncData): SyncData {
    syncData.changed?.forEach((bookmark) => {
      this._bookmarkRepository.setBookmark(bookmark, syncData.clientId);
    });
    syncData.removed?.forEach((uid) => {
      this._bookmarkRepository.removeBookmark(uid, syncData.clientId);
    });
    if (syncData.changed?.length || syncData.removed?.length) {
      TUIEventBus.instance.emit(TUIEvents.SearchQueryChanged);
    }
    syncData.confirmed?.forEach((uid) => {
      this._bookmarkRepository.confirmSync(uid, syncData.clientId!);
    });
    return {
      confirmed: [
        ...(syncData.changed?.map((b) => b.uid) ?? []),
        ...(syncData.removed ?? []),
      ],
      ...this._db.getSyncData(syncData.clientId!),
    };
  }

  private startHttpServer(): void {
    startHttpServer({
      onStatus: () => 'ok',
      onSync: (syncData: SyncData): SyncData => this.sync.bind(this)(syncData),
    } as IHttpServerHandlers);
  }

  private updateSearchResults(): void {
    this._tui!.bookmarks = this._bookmarkRepository.search(
      this._tui!.searchQuery,
    );
  }

  async deleteBookmark(bookmark: Bookmark): Promise<void> {
    deleteDialog(this._tui!.renderer, this._colorScheme, bookmark);
  }

  async editBookmark(bookmark: Bookmark): Promise<void> {
    try {
      this._renderer?.suspend();
      const { hash: oldHash } = bookmark;
      const { title, url } = await openInEditor(
        bookmark,
        this._config.general.editor,
      );
      const newHash = createBookmarkHash({ title, url });
      if (oldHash === newHash) {
        return;
      }
      const editedBookmark = createBookmark({
        ...bookmark,
        title,
        url,
        modified: Date.now(),
      });
      await this._bookmarkRepository.setBookmark(editedBookmark);
      this.updateSearchResults();
      infoToast(
        this._renderer!,
        this._colorScheme,
        `Bookmark edited: ${title}`,
      );
    } catch (e) {
      errorToast(this._renderer!, this._colorScheme, e);
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
      infoToast(this._renderer!, this._colorScheme, `Bookmark added: ${title}`);
      this.updateSearchResults();
    } catch (e) {
      errorToast(this._renderer!, this._colorScheme, e);
    } finally {
      this._renderer?.resume();
    }
  }

  async init(): Promise<void> {
    this._db.init();
    this._bookmarkRepository.init();

    const renderer = await this.createRenderer();
    Keymap.init(renderer, this._config.keymap);

    this._tui = new TUI(renderer, this._colorScheme);
    this.updateSearchResults();

    TUIEventBus.instance.on(
      TUIEvents.SearchQueryChanged,
      this.updateSearchResults.bind(this),
    );

    TUIEventBus.instance.on(
      TUIEvents.BookmarkActionRequest,
      (bookmark: Bookmark) => {
        openUrl.bind(this)(bookmark.url, this._config.general.browserCommand);
      },
    );

    TUIEventBus.instance.on(
      TUIEvents.BookmarkDeleteRequest,
      async (bookmark: Bookmark) => {
        await this._bookmarkRepository.removeBookmark(bookmark.uid);
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
