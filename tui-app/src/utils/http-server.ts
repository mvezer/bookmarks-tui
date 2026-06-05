import { createServer, IncomingMessage } from 'node:http';
import { isBoookmarkChange, type BookmarkChange } from '@bookmarks-tui/common';

const PORT = 31531;

export interface IHttpServerHandlers {
  onStatus: () => string;
  onSyncReceived: (changes: [string, BookmarkChange][]) => Promise<string[]>;
  onSyncRequested: () => [string, BookmarkChange][];
  onSyncConfirmed: (syncedIds: string[]) => Promise<void>;
}

const readJSONbody = <T>(req: IncomingMessage): Promise<T> => {
  return new Promise((resolve, reject) => {
    const body: string[] = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });
    req.on('end', async () => {
      resolve(JSON.parse(body.join('')) as T);
    });
    req.on('error', reject);
  });
};

const respond = (res: any, statusCode: number, body: string | unknown = '') => {
  const isString = typeof body === 'string';
  if (!isString) {
    res.setHeader('Content-Type', 'application/json');
  }
  res.writeHead(statusCode);
  res.end(isString ? body : JSON.stringify(body));
};

export const startHttpServer = (handlers: IHttpServerHandlers) => {
  const server = createServer(async (req: IncomingMessage, res) => {
    if (req.url === '/status' && req.method === 'GET') {
      respond(res, 200, handlers.onStatus());
    }
    if (req.url === '/sync/chrome' && req.method === 'POST') {
      const incomingChanges =
        await readJSONbody<[string, BookmarkChange][]>(req);
      if (
        !Array.isArray(incomingChanges) ||
        incomingChanges.some((change) => {
          if (!Array.isArray(change)) return true;
          const [id, c] = change;
          return typeof id !== 'string' || !isBoookmarkChange(c);
        })
      ) {
        console.error('invalid bookmarks sync data', incomingChanges);
        respond(res, 400, 'Invalid bookmarks change data');
        return;
      }
      try {
        const processedChangeIds =
          await handlers.onSyncReceived(incomingChanges);
        console.log({ processedChangeIds });
        respond(res, 200, { processedChangeIds });
      } catch (e: unknown) {
        console.error(e);
        respond(res, 500, { error: (e as Error).message || 'Unknown error' });
      }
    }
    if (req.url === '/sync/chrome' && req.method === 'GET') {
      respond(res, 200, handlers.onSyncRequested());
    }
    if (req.url === '/sync/confirm' && req.method === 'POST') {
      const syncedIds = await readJSONbody<string[]>(req);
      if (!Array.isArray(syncedIds)) {
        console.error('invalid synced ids', syncedIds);
        respond(res, 400, 'Invalid synced ids');
        return;
      }
      try {
        await handlers.onSyncConfirmed(syncedIds);
        respond(res, 200);
      } catch (e: unknown) {
        console.error(e);
        respond(res, 500, { error: (e as Error).message || 'Unknown error' });
      }
    }
  });
  server.listen(PORT);
};
