import * as _ from 'lodash/fp';
import deepmerge from 'deepmerge';

import { getContentFromPath } from './files';
import { LANGUAGE_INDEX_SYMBOL } from './language';
import { ContentItem, TreeMap, TreeItem, TreeItemStatus } from '../types';
import { LoadedFolder, LoadedGroup, LoadedPath, ParsedFile } from '@common/types';

export const pathToString = (path: any[]): string =>
  path.map((it) => (typeof it === 'symbol' ? `Symbol(${it.description})` : it)).join('.');

export const createTree = (
  tree: TreeMap,
  folder: LoadedPath[],
  parent: string = '',
  parentPath: any[] = [],
  level: number = 0,
) => {
  const length = folder.length;

  for (let index = 0; index < length; ++index) {
    const item = folder[index];

    const path = parentPath.concat([index, 'items']);
    if (item.type !== 'folder') {
      path.push(LANGUAGE_INDEX_SYMBOL, 'data');
    }

    const id = pathToString(path);
    let treeItem = tree[id];
    if (!treeItem) {
      treeItem = {
        id,
        parent,
        path,
        type: item.type,
        status: 'normal',
        label: item.name,
        missingCount: 0,
        duplicatedCount: 0,
        level,
      };

      tree[id] = treeItem;
    }

    if (treeItem.type === 'folder') {
      createTree(tree, (item as LoadedFolder).items, treeItem.id, treeItem.path, level + 1);
    } else {
      createParsedFileTree(
        tree,
        (item as LoadedGroup).items,
        treeItem.id,
        treeItem.path,
        level + 1,
      );
    }
  }
};

const createParsedFileTree = (
  tree: TreeMap,
  items: ParsedFile[],
  parent: string = '',
  parentPath: any[] = [],
  level: number = 0,
) => {
  const folderData = items.map((it) => it.data);
  const objectTree = deepmerge.all(folderData);

  createTreeFromObject(tree, objectTree, parent, parentPath, level);
};

const createTreeFromObject = (
  tree: TreeMap,
  objectTree: any,
  parent: string = '',
  parentPath: any[] = [],
  level: number = 0,
) => {
  const keys = Object.keys(objectTree);
  const length = keys.length;

  for (let i = 0; i < length; ++i) {
    const key = keys[i];

    const path = parentPath.concat(key);
    const isItem =
      typeof objectTree[key] === 'string' ||
      objectTree[key] === null ||
      objectTree[key] === undefined;

    const id = pathToString(path);
    let item = tree[id];
    if (!item) {
      item = {
        id,
        parent,
        path,
        type: isItem ? 'item' : 'node',
        status: 'normal',
        label: key,
        missingCount: 0,
        duplicatedCount: 0,
        level,
      };
      tree[id] = item;
    }

    if (!isItem) {
      createTreeFromObject(tree, objectTree[key], item.id, item.path, level + 1);
    }
  }
};

// TREE STATUS
export const createTreeStatus = (
  tree: TreeMap,
  folder: LoadedPath[],
  originalFolder: LoadedPath[],
) => {
  const items = Object.values(tree).filter((it) => it.type === 'item');

  for (const item of items) {
    updateTreeItemStatus(item, folder, originalFolder);
  }

  const parents = _.uniq(items.map((it) => it.parent));
  for (const parent of parents) {
    updateTreeStatus(tree, folder, originalFolder, parent);
  }
};

export const updateTreeStatus = (
  tree: TreeMap,
  folder: LoadedPath[],
  originalFolder: LoadedPath[],
  itemId: string,
) => {
  if (!itemId) return;

  const item = tree[itemId];
  if (!item) return;

  if (item.type === 'item') {
    updateTreeItemStatus(item, folder, originalFolder);
  } else {
    updateNonItemMissingCount(item, tree);
  }

  updateTreeStatus(tree, folder, originalFolder, item.parent);
};

export const updateTreeItemStatus = (
  item: TreeItem,
  folder: LoadedPath[],
  originalFolder: LoadedPath[],
) => {
  const content = getContentFromPath(folder, item.path);
  const originalContent = getContentFromPath(originalFolder, item.path);

  const treeItemStatus = getTreeItemStatus(content, originalContent);

  item.status = treeItemStatus;
  item.missingCount = treeItemStatus === 'missing' ? content.filter((it) => !it.value).length : 0;
  item.duplicatedCount = getDuplicatedCount(content);
};

export const updateNonItemMissingCount = (item: TreeItem, tree: TreeMap) => {
  item.missingCount = getMissingChildrenCount(tree, item.id);
  item.duplicatedCount = getDuplicatedChildrenCount(tree, item.id);
};

const getMissingChildrenCount = (tree: TreeMap, itemId: string) =>
  getChildrenPropertyCount(tree, itemId, (it) => it.missingCount);

const getDuplicatedChildrenCount = (tree: TreeMap, itemId: string) =>
  getChildrenPropertyCount(tree, itemId, (it) => it.duplicatedCount);

const getChildrenPropertyCount = (
  tree: TreeMap,
  itemId: string,
  propertyFn: (item: TreeItem) => number,
) =>
  Object.values(tree)
    .filter((it) => it.parent === itemId) // item children
    .map(propertyFn)
    .reduce((acc, curr) => acc + curr, 0);

export const getTreeItemStatus = (
  content: ContentItem[],
  originalContent: ContentItem[],
): TreeItemStatus => {
  if (isMissingItem(content)) {
    return 'missing';
  }

  if (isNewItem(originalContent)) {
    return 'new';
  }

  if (isChangedItem(content, originalContent)) {
    return 'changed';
  }

  return 'normal';
};

export const getDuplicatedCount = (content: ContentItem[]): number =>
  _.flow(
    _.filter((it: ContentItem) => it.value),
    _.groupBy('value'),
    Object.entries,
    _.filter(([key, value]) => key !== undefined && value.length > 1),
    _.sumBy(([key, value]) => value.length),
  )(content);

const isNewItem = (originalContent: ContentItem[]) =>
  originalContent.filter((it) => it.value !== undefined).length === 0;

const isChangedItem = (content: ContentItem[], originalContent: ContentItem[]) =>
  _.zip(content, originalContent).filter(
    ([item, originalItem]) => item?.value !== originalItem?.value,
  ).length > 0;

const isMissingItem = (content: ContentItem[]) => content.filter((it) => !it.value).length > 0;
