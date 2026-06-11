import { BOOKMARKS_TUI_FOLDER_NAME } from './constants';

export type BookmarkTreeNode = chrome.bookmarks.BookmarkTreeNode & {
  trash?: boolean;
};

type TreeNodeFilter = (node: BookmarkTreeNode) => boolean;

export const traverseFilters: Record<
  | 'bookmarksTuiFolder'
  | 'bookmarks'
  | 'bookmarksBarFolder'
  | 'folders'
  | 'trashFolder',
  TreeNodeFilter
> = {
  bookmarksTuiFolder: (node: BookmarkTreeNode) =>
    !node.url && node.title === BOOKMARKS_TUI_FOLDER_NAME,
  bookmarks: (node: BookmarkTreeNode) => node.url !== undefined && !node.trash,
  bookmarksBarFolder: (node: BookmarkTreeNode) =>
    node.url === undefined &&
    node.folderType === chrome.bookmarks.FolderType.BOOKMARKS_BAR,
  folders: (node: BookmarkTreeNode): boolean => node.url === undefined,
  trashFolder: (node: BookmarkTreeNode): boolean =>
    node.url === undefined &&
    (node.title.toLowerCase() === 'trash' || !!node.trash),
};

export const traverseBookmarkTree = (
  tree: BookmarkTreeNode[],
  filter?: TreeNodeFilter,
): BookmarkTreeNode[] => {
  const stack: BookmarkTreeNode[] = JSON.parse(JSON.stringify(tree));
  const nodes: BookmarkTreeNode[] = [];
  while (stack.length > 0) {
    const n = stack.pop()!;
    if (!traverseFilters.trashFolder(n)) {
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
