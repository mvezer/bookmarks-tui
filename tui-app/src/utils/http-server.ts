import { type SyncData, isSyncData } from '@bookmarks-tui/common/sync';
import { PORT } from '@bookmarks-tui/common/constants';
import { URL } from 'node:url';

export interface IHttpServerHandlers {
  onStatus: () => string;
  onSync: (syncData: SyncData) => SyncData;
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const startHttpServer = (handlers: IHttpServerHandlers): void => {
  const server = Bun.serve({
    port: PORT,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === '/status' && req.method === 'GET') {
        return jsonResponse(handlers.onStatus());
      }

      if (url.pathname === '/sync' && req.method === 'POST') {
        try {
          const syncData = await req.json();
          if (!isSyncData(syncData)) {
            throw new Error('Invalid sync data');
          }
          if (!syncData.clientId) {
            throw new Error('Missing clientId');
          }
          return jsonResponse(handlers.onSync(syncData));
        } catch (e) {
          console.error(e);
          return jsonResponse(
            { error: (e as Error).message || 'Unknown error' },
            400,
          );
        }
      }

      return jsonResponse({ error: 'Not found' }, 404);
    },
  });
};
