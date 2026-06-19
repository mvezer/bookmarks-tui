import { SyncData } from '@bookmarks-tui/common/sync';
import { Bookmark } from '@bookmarks-tui/common/bookmarks';
import { ReverseLookupFieldMap } from '@bookmarks-tui/common/reverse-lookup-map';
import { SETTINGS_KEY } from './settings';
import { METRICS_KEY } from './metrics';

export interface TrackingData {
  hash: string;
  modifiedAt: number;
  id: string;
  uid: string;
  syncedAt: number;
  isDeleted: boolean;
}

export class Tracking {
  private static _instance: Tracking;
  private _trackingMap: Map<string, TrackingData>;
  private _bookmarks = new ReverseLookupFieldMap<string, Bookmark, 'uid'>(
    'uid',
  ); // id -> bookmark

  private constructor(trackingEntries: { [uid: string]: TrackingData }) {
    this._trackingMap = new Map<string, TrackingData>(
      Object.entries(trackingEntries),
    );
  }

  static async create(): Promise<Tracking> {
    if (Tracking._instance) {
      return Tracking._instance;
    }
    const trackingUIDs = (await chrome.storage.local.getKeys()).filter(
      (key) => ![METRICS_KEY, SETTINGS_KEY].includes(key),
    );
    const trackingEntries = await chrome.storage.local.get<{
      [uid: string]: TrackingData;
    }>(trackingUIDs);
    Tracking._instance = new Tracking(trackingEntries);
    return Tracking._instance;
  }

  static get instance(): Tracking {
    if (!Tracking._instance) {
      throw new Error('Tracking not initialized');
    }
    return Tracking._instance;
  }

  getById(id: string): TrackingData | undefined {
    return Array.from(this._trackingMap.values()).find(
      (t) => !t.isDeleted && t.id === id,
    );
  }

  getByUID(uid: string): TrackingData | undefined {
    return this._trackingMap.get(uid);
  }

  async setBookmark(
    bookmark: Bookmark,
    id: string,
    syncedAt = 0,
  ): Promise<void> {
    // find the tracking with the matching id which does not belong to a deleted bookmark
    let trackingPayload = this.getById(id);

    const isNewBookmark = trackingPayload === undefined;
    const isChangedBookmark = trackingPayload?.hash !== bookmark.hash;

    if (isNewBookmark) {
      trackingPayload = {
        id,
        hash: bookmark.hash,
        modifiedAt: Date.now(),
        uid: bookmark.uid,
        syncedAt,
        isDeleted: false,
      };
    } else if (isChangedBookmark) {
      trackingPayload!.hash = bookmark.hash;
      trackingPayload!.modifiedAt = Date.now();
      trackingPayload!.syncedAt = syncedAt;
    }

    bookmark.uid = trackingPayload!.uid;
    this._bookmarks.set(trackingPayload!.uid, bookmark);

    if (isNewBookmark || isChangedBookmark) {
      this._trackingMap.set(trackingPayload!.uid, trackingPayload!);
      await chrome.storage.local.set({
        [trackingPayload!.uid]: trackingPayload!,
      });
    }
  }

  async removeBookmarkById(id: string, syncedAt = 0) {
    const trackingPayload = this.getById(id);
    if (trackingPayload) {
      trackingPayload.isDeleted = true;
      trackingPayload.syncedAt = syncedAt;
      trackingPayload.modifiedAt = Date.now();
      this._bookmarks.delete(trackingPayload.uid);
      await chrome.storage.local.set({
        [trackingPayload.uid]: trackingPayload,
      });
    }
  }

  async confirmSync(uid: string) {
    const trackingPayload = this.getByUID(uid);
    if (trackingPayload) {
      trackingPayload.syncedAt = Date.now();
      await chrome.storage.local.set({
        [trackingPayload.uid]: trackingPayload,
      });
    }
  }

  hasBookmark(uid: string): boolean {
    return this._bookmarks.has(uid);
  }

  get syncData(): SyncData {
    const syncData = {} as SyncData;
    Array.from(this._trackingMap.values())
      .filter((t) => !t.syncedAt)
      .forEach((t) => {
        if (t.isDeleted) {
          if (syncData.removed) {
            syncData.removed.push(t.uid);
          } else {
            syncData.removed = [t.uid];
          }
        } else {
          const bookmark = this._bookmarks.get(t.uid);
          if (bookmark) {
            if (syncData.changed) {
              syncData.changed.push(bookmark);
            } else {
              syncData.changed = [bookmark];
            }
          } else {
            console.warn(`Bookmark is missing! (uid: ${t.uid}`);
          }
        }
      });

    return syncData;
  }
}
