import { BOOKMARKS_TUI_FOLDER_NAME } from './constants';
import { Bookmark, createBookmark } from '@bookmarks-tui/common/bookmarks';

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode & {
  trash?: boolean;
};

export const isFolder = (node: BookmarkTreeNode): boolean => {
  return node.url === undefined;
};

type TreeNodeFilter = (node: BookmarkTreeNode) => boolean;
export const TraverseFilters: Record<
  | 'bookmarksTuiFolder'
  | 'bookmarks'
  | 'bookmarksBarFolder'
  | 'folders'
  | 'trashFolder',
  TreeNodeFilter
> = {
  bookmarksTuiFolder: (node: BookmarkTreeNode) =>
    isFolder(node) && node.title === BOOKMARKS_TUI_FOLDER_NAME,
  bookmarks: (node: BookmarkTreeNode) => !isFolder(node) && !node.trash,
  bookmarksBarFolder: (node: BookmarkTreeNode) =>
    isFolder(node) &&
    node.folderType === chrome.bookmarks.FolderType.BOOKMARKS_BAR,
  folders: (node: BookmarkTreeNode): boolean => !isFolder(node),
  trashFolder: (node: BookmarkTreeNode): boolean =>
    isFolder(node) && (node.title.toLowerCase() === 'trash' || !!node.trash),
};

export const createBookmarkFromTreeNode = (
  node: BookmarkTreeNode,
  uid?: string,
): Bookmark => {
  const { title, url } = node;
  if (!title || !url) {
    throw new Error('Invalid bookmark');
  }
  return createBookmark({
    uid,
    title,
    url,
  });
};

export class BookmarkTree {
  private _tree: BookmarkTreeNode[] = [];

  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    const bookmarkTree: BookmarkTreeNode[] = await chrome.bookmarks.getTree();
    this._tree = bookmarkTree;
  }

  traverse = (filter?: TreeNodeFilter): BookmarkTreeNode[] => {
    const stack: BookmarkTreeNode[] = JSON.parse(JSON.stringify(this._tree));
    const nodes: BookmarkTreeNode[] = [];
    while (stack.length > 0) {
      const n = stack.pop()!;
      if (!TraverseFilters.trashFolder(n)) {
        nodes.push(n);
        if (n.children) {
          stack.push(...n.children);
        }
      }
    }

    if (filter === undefined) {
      return nodes;
    }
    return nodes.filter(filter);
  };

  getNodeById(id: string): BookmarkTreeNode | undefined {
    return this.traverse((n) => n.id === id)?.pop();
  }

  getNodesByTitle(title: string): BookmarkTreeNode[] {
    return this.traverse((n) => n.title === title);
  }

  async createNode(
    node: chrome.bookmarks.CreateDetails,
  ): Promise<BookmarkTreeNode> {
    return chrome.bookmarks.create(node);
  }
  async updateNode(
    id: string,
    node: chrome.bookmarks.UpdateChanges,
  ): Promise<BookmarkTreeNode> {
    return chrome.bookmarks.update(id, node);
  }

  get isInitialized(): boolean {
    return this._tree.length > 0;
  }

  get tree(): BookmarkTreeNode[] {
    return this._tree;
  }
}
