import { PORT } from '@bookmarks-tui/common/constants';
import { SyncData, isSyncData } from '@bookmarks-tui/common/sync';

const HOST = `http://localhost:${PORT}`;

export enum HostStatus {
  Unknown,
  Alive,
  Inactive,
}

export const sendSyncRequest = async (
  syncRequest: SyncData,
): Promise<SyncData> => {
  const response = await fetch(new URL('sync', HOST).toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(syncRequest),
  });
  if (!response.ok) {
    throw new Error('sync request failed');
  }
  const syncResponse = await response.json();
  if (!isSyncData(syncRequest)) {
    throw new Error(`invalid sync response: ${syncResponse}`);
  }
  return syncResponse as SyncData;
};

export const getHostStatus = async (): Promise<HostStatus> => {
  try {
    const response = await fetch(new URL('status', HOST).toString());
    if (response.ok) {
      return HostStatus.Alive;
    }
    return HostStatus.Inactive;
  } catch (e) {
    return HostStatus.Inactive;
  }
};
