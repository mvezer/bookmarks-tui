import { Bookmark, isBookmark } from './bookmark';

export interface SyncData {
  clientId?: string;
  changed?: Bookmark[];
  removed?: string[];
  confirmed?: string[];
}

export const isSyncDataEmpty = (data: SyncData): boolean => {
  return (
    (!data.changed || data.changed.length === 0) &&
    (!data.removed || data.removed.length === 0) &&
    (!data.confirmed || data.confirmed.length === 0)
  );
};

export const mergeSyncData = (syncData: SyncData[]): SyncData => {
  const response = {} as SyncData;
  for (const data of syncData) {
    if (data.confirmed) {
      response.confirmed = response.confirmed
        ? response.confirmed.concat(data.confirmed)
        : data.confirmed;
    }
    if (data.changed) {
      response.changed = response.changed
        ? response.changed.concat(data.changed)
        : data.changed;
    }
    if (data.removed) {
      response.removed = response.removed
        ? response.removed.concat(data.removed)
        : data.removed;
    }
  }
  return response;
};

export const isSyncData = (data: unknown): data is SyncData => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const changesValid =
    !('changed' in data) ||
    ('changed' in data &&
      Array.isArray(data.changed) &&
      (data.changed.length === 0 || data.changed.every(isBookmark)));
  const removalsValid =
    !('removed' in data) ||
    ('removed' in data &&
      Array.isArray(data.removed) &&
      (data.removed.length === 0 ||
        data.removed.every((r) => typeof r === 'string')));
  const confimsValid =
    !('confirmed' in data) ||
    ('confirmed' in data &&
      Array.isArray(data.confirmed) &&
      (data.confirmed.length === 0 ||
        data.confirmed.every((r) => typeof r === 'string')));
  const clientIdValid =
    !('clientId' in data) ||
    ('clientId' in data && typeof data.clientId === 'string');

  return changesValid && removalsValid && confimsValid && clientIdValid;
};
