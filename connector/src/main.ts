import {
  Bookmark,
  type BookmarkSync,
  BookmarkAddSync,
  BookmarkRemoveSync,
  createAddBookmarkSync,
  createRemoveBookmarkSync,
  createBookmarkHash,
} from "@bookmarks-tui/common";

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode & {
  description?: string;
};

const syncData: Map<string, BookmarkSync> = new Map<string, BookmarkSync>();
const hashLookupMap = new Map<string, string>(); // hash -> id

enum HostStatus {
  Unknown,
  Alive,
  Inactive,
}

let lastHostStatus: HostStatus = HostStatus.Unknown;

const isSyncNeeded = () => {
  return syncData.size > 0;
};

let isInitialized = false;

const HOST = "http://localhost:31531/";

const createBookmarkFromTreeNode = (node: BookmarkTreeNode): Bookmark => {
  const { title, url } = node;
  if (!title || !url) {
    throw new Error("Invalid bookmark");
  }
  return {
    id: node.id,
    dateAdded: node.dateAdded ?? Date.now(),
    description: node.description || "",
    title,
    url,
    hash: createBookmarkHash({ title, url }),
  };
};

const isUrlBookmark = (node: BookmarkTreeNode): boolean => !!node.url;

async function getAllBookmarks(): Promise<void> {
  console.log("getAllBookmarks");
  const tree: BookmarkTreeNode[] = await chrome.bookmarks.getTree();
  const stack: BookmarkTreeNode[] = [];
  for (const node of tree) {
    if (node.children) {
      stack.push(...node.children);
    } else if (isUrlBookmark(node)) {
      onBookmarkCreated(node.id, node);
    }
  }

  while (stack.length > 0) {
    let node = stack.pop();
    if (!node) {
      continue;
    }
    if (node.children) {
      stack.push(...node.children);
    } else if (isUrlBookmark(node)) {
      onBookmarkCreated(node.id, node);
    }
  }
  console.log("getAllBookmarks done");
  console.log(syncData);
}

const isHostAlive = async (): Promise<boolean> => {
  try {
    const response = await fetch(new URL("status", HOST).toString());
    return response.ok;
  } catch (e) {
    return false;
  }
};

export const init = async (): Promise<void> => {
  console.log("init");
  if (!isInitialized) {
    await getAllBookmarks();
    isInitialized = true;
  }
};

export const onBookmarkCreated = (
  id: string,
  bookmarkTreeNode: BookmarkTreeNode,
) => {
  const bookmark = createBookmarkFromTreeNode(bookmarkTreeNode);
  const syncItem = createAddBookmarkSync(bookmark);
  hashLookupMap.set(bookmark.hash, id);
  syncData.set(syncItem.uuid, syncItem);
};

export const onBookmarkRemoved = async (id: string) => {
  const syncItem = createRemoveBookmarkSync(id);
  syncData.set(syncItem.uuid, syncItem);
  try {
    const bookmark = await chrome.bookmarks.get(id);
    if (!bookmark || !bookmark[0]) {
      return;
    }
    const { title, url } = createBookmarkFromTreeNode(bookmark[0]);
    hashLookupMap.delete(createBookmarkHash({ title, url }));
  } catch (e) {
    console.error(e);
  }
};

export const onBookmarkChanged = (
  id: string,
  bookmarkChangedData: Omit<BookmarkTreeNode, "id">,
) => {
  const bookmark = createBookmarkFromTreeNode({ ...bookmarkChangedData, id });
  const syncItem = createAddBookmarkSync(bookmark);
  hashLookupMap.set(bookmark.hash, id);
  syncData.set(syncItem.uuid, syncItem);
};

export const updateIcon = async (isAlive: boolean): Promise<void> => {
  if (!isAlive) {
    chrome.action.setIcon(
      { path: "/icon/bookmarks-tui-connector-inactive-48px.png" },
      () => {},
    );
    return;
  }
  chrome.action.setIcon(
    { path: "/icon/bookmarks-tui-connector-48px.png" },
    () => {},
  );
};

const sync = async (): Promise<void> => {
  console.log("sync!!");
  console.log(syncData);
  try {
    // send the sync data to the server and check if there's sync data coming back
    const response = await fetch(new URL("sync/chrome", HOST).toString(), {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(Array.from(syncData.values())),
    });
    if (response.ok) {
      const res = await response.json();
      const { syncedIds } = res;
      if (syncedIds && Array.isArray(syncedIds)) {
        for (const syncedId of syncedIds) {
          console.log("synced id", syncedId);
          syncData.delete(syncedId);
        }
      } else {
        console.error("invalid sync response", res);
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const requestSync = async (): Promise<void> => {
  const response = await fetch(new URL("sync/chrome", HOST).toString(), {
    headers: {
      "Content-Type": "application/json",
    },
    method: "GET",
  });
  if (response.ok) {
  }
};

export const heartbeat = async (): Promise<void> => {
  console.log("<3");
  const isAlive = await isHostAlive();
  if (isAlive && lastHostStatus === HostStatus.Alive) {
    await updateIcon(true);
  } else if (!isAlive && lastHostStatus === HostStatus.Inactive) {
    await updateIcon(false);
  }
  lastHostStatus = isAlive ? HostStatus.Alive : HostStatus.Inactive;
  if (isAlive && isSyncNeeded()) {
    await sync();
  }
};
