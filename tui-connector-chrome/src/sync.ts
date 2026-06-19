import {
  isSyncDataEmpty,
  SyncData,
  mergeSyncData,
} from '@bookmarks-tui/common/sync';
import {
  ChromeBookmarkEventIgnoreMap,
  ChromeBookmarkEventChangeKind,
} from './ignore-map';
import { BookmarkTreeNode, createBookmarkFromTreeNode } from './bookmarks-tree';
import { Tracking } from './storage/tracking';
import { Settings } from './storage/settings';

export class Sync {
  constructor(private _ignoreMap: ChromeBookmarkEventIgnoreMap) {}

  async process(syncData: SyncData[] | SyncData): Promise<SyncData> {
    if (Array.isArray(syncData)) {
      syncData = mergeSyncData(syncData);
    }

    if (isSyncDataEmpty(syncData)) {
      return syncData;
    }

    const { changed, removed, confirmed } = syncData;
    const response = {} as SyncData;

    for (const bookmark of changed || []) {
      try {
        let trackingPayload = Tracking.instance.getByUID(bookmark.uid);
        const { url, title, uid, hash } = bookmark;
        if (hash === trackingPayload?.hash) {
          continue;
        }

        let createdOrUpdatedBookmarkTreeNode: BookmarkTreeNode | undefined;
        if (!trackingPayload) {
          createdOrUpdatedBookmarkTreeNode = await chrome.bookmarks.create({
            parentId: Settings.instance.get('bookmarksTuiFolderId'),
            url,
            title,
          });
          this._ignoreMap.set(uid, ChromeBookmarkEventChangeKind.Add);
        } else {
          createdOrUpdatedBookmarkTreeNode = await chrome.bookmarks.update(
            trackingPayload.id,
            {
              title,
              url,
            },
          );
          this._ignoreMap.set(uid, ChromeBookmarkEventChangeKind.Update);
        }
        if (!createdOrUpdatedBookmarkTreeNode?.url) {
          console.error('invalid bookmark', createdOrUpdatedBookmarkTreeNode);
          continue;
        }
        await Tracking.instance.setBookmark(
          createBookmarkFromTreeNode(
            createdOrUpdatedBookmarkTreeNode,
            bookmark.uid,
          ),
          createdOrUpdatedBookmarkTreeNode.id,
          Date.now(),
        );
      } catch (e) {
        console.error('failed to create/update bookmark:', bookmark);
      } finally {
        if (!response.confirmed) {
          response.confirmed = [];
        }
        response.confirmed.push(bookmark.uid);
      }
    }
    for (const uid of removed || []) {
      try {
        let trackingPayload = Tracking.instance.getByUID(uid);
        if (!trackingPayload) {
        } else {
          this._ignoreMap.set(uid, ChromeBookmarkEventChangeKind.Remove);
          await chrome.bookmarks.remove(trackingPayload.id);
        }
        await Tracking.instance.removeBookmarkById(uid);
      } catch (e) {
        console.error('failed to remove bookmark', uid);
      } finally {
        if (!response.confirmed) {
          response.confirmed = [];
        }
        response.confirmed.push(uid);
      }
    }

    for (const uid of confirmed || []) {
      await Tracking.instance.confirmSync(uid);
    }

    return response;
  }
}
