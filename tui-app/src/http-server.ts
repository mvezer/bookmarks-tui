import { createServer, IncomingMessage } from "node:http";
import { type BookmarkSync, isBookmarkSync } from "@bookmarks-tui/common";

const PORT = 31531;

export const startHttpServer = (handlers: {
  onStatus: () => string;
  onSyncReceived: (syncData: BookmarkSync[]) => string[];
  onSyncRequested: () => BookmarkSync[];
  onSyncConfirmed: (syncedIds: string[]) => void;
}) => {
  const server = createServer(async (req: IncomingMessage, res) => {
    if (req.url === "/status" && req.method === "GET") {
      res.writeHead(200);
      res.end(handlers.onStatus());
    }
    if (req.url === "/sync/chrome" && req.method === "POST") {
      const body: string[] = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", async () => {
        const bookmarksSyncData = JSON.parse(body.join(""));
        if (
          !Array.isArray(bookmarksSyncData) ||
          bookmarksSyncData.some((b) => !isBookmarkSync(b))
        ) {
          console.error("invalid bookmarks sync data", bookmarksSyncData);
          return;
        }
        const syncedIds = handlers.onSyncReceived(bookmarksSyncData);
        res.setHeader("Content-Type", "application/json");
        res.writeHead(200);
        res.end(JSON.stringify({ syncedIds }));
      });
    }
    if (req.url === "/sync/chrome" && req.method === "GET") {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(handlers.onSyncRequested()));
    }
    if (req.url === "/sync/confirm" && req.method === "POST") {
      const body: string[] = [];
      req.on("data", (chunk) => {
        body.push(chunk);
      });
      req.on("end", async () => {
        const syncedIds = JSON.parse(body.join(""));
        if (!Array.isArray(syncedIds)) {
          console.error("invalid synced ids", syncedIds);
          return;
        }
        handlers.onSyncConfirmed(syncedIds);
        res.writeHead(200);
        res.end();
      });
    }
  });
  server.listen(PORT);
};
