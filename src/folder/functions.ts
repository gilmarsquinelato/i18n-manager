import * as _ from 'lodash/fp';
import * as immutable from 'object-path-immutable';
import uuid from 'uuid/v1';

import { getLocaleLabel } from '@common/language';
import {
  IContentItem,
  ITreeItem,
  TreeItemStatus,
} from '@src/folder/types';
import {
  ILoadedFolder,
  ILoadedGroup,
  ILoadedPath,
  IParsedFile,
} from '@typings/index';

const LANGUAGE_INDEX_SYMBOL = Symbol('languageIndex');

export const containsLanguage = (supportedLanguages: string[], language: string) =>
  supportedLanguages.includes(language) ||
  supportedLanguages.includes(language.split('-')[0]);

export const updateTreeStatus = (
  tree: ITreeItem[],
  folder: ILoadedPath[],
  originalFolder: ILoadedPath[],
  itemId: string,
): ITreeItem[] => {
  let item = tree.find(it => it.id === itemId);
  if (!item) {
    return tree;
  }
  const itemIndex = tree.indexOf(item);

  if (item.type === 'item') {
    item = updateTreeItemStatus(item, folder, originalFolder);
  } else {
    item = updateNonItemMissingCount(item, tree);
  }

  const newTree = immutable.set(tree, itemIndex.toString(), item);
  return updateTreeStatus(newTree, folder, originalFolder, item.parent);
};

export const updateNonItemMissingCount = (treeItem: ITreeItem, tree: ITreeItem[]) => ({
  ...treeItem,
  missingCount: getMissingCount(tree, treeItem.id),
});

const getMissingCount = (tree: ITreeItem[], itemId: string) =>
  tree
    .filter(it => it.parent === itemId) // item children
    .map(it => it.missingCount)
    .reduce((acc, curr) => acc + curr, 0);

export const updateTreeItemStatus = (
  item: ITreeItem,
  folder: ILoadedPath[],
  originalFolder: ILoadedPath[],
): ITreeItem => {
  const content = getContentFromPath(folder, item.path);
  const originalContent = getContentFromPath(originalFolder, item.path);

  const treeItemStatus = getTreeItemStatus(content, originalContent);
  return {
    ...item,
    status: treeItemStatus,
    missingCount: treeItemStatus === 'missing'
      ? content.filter(it => !it.value).length
      : 0,
  };
};

export const removeTreeItem = (tree: ITreeItem[], item: ITreeItem): ITreeItem[] => {
  let newTree = tree;

  const children = tree.filter(it => it.parent === item.id);
  for (const child of children) {
    newTree = removeTreeItem(newTree, child);
  }

  const treeItemIndex = newTree.findIndex(it => it.id === item.id);

  return immutable.del(newTree, treeItemIndex.toString());
};

export const getLanguageLabel = (language: string): string => {
  const localeLabel = getLocaleLabel(language);
  if (!localeLabel) {
    return language;
  }

  return `${localeLabel} - ${language}`;
};

export const createTree = (
  folder: ILoadedPath[],
  parent: string = '',
  parentPath: any[] = [],
): ITreeItem[] => {
  return folder
    .map((it, index) => {
      const id = uuid();
      const path = parentPath.concat([index, 'items']);
      if (it.type !== 'folder') {
        path.push(LANGUAGE_INDEX_SYMBOL, 'data');
      }

      const treeItem: ITreeItem = {
        id,
        parent,
        path,
        type: it.type,
        status: 'normal',
        label: it.name,
        missingCount: 0,
      };

      if (it.type === 'folder') {
        return [treeItem, ...createTree((it as ILoadedFolder).items, id, path)];
      }

      return [treeItem].concat(createParsedFileTree((it as ILoadedGroup).items, id, path));
    })
    .flat();
};

export const getParsedFiles = (
  items: ILoadedPath[],
  path: any[],
): IParsedFile[] => {
  const parentPath = path.slice(0, path.indexOf(LANGUAGE_INDEX_SYMBOL));
  return _.getOr([], parentPath, items) as unknown as IParsedFile[];
};

export const getContentFromPath = (
  folder: ILoadedPath[],
  path: any[],
): IContentItem[] => {
  const parsedFiles = getParsedFiles(folder, path);

  return parsedFiles.map((item, index) => ({
    language: item.language,
    languageIndex: index,
    value: _.get(getLanguagePath(path, index), folder) as any,
  }));
};

export const getLanguagePath =
  (path: any[], languageIndex: number): any[] =>
    path.map(
      it => it === LANGUAGE_INDEX_SYMBOL
        ? languageIndex
        : it);

export const getFormattedPath = (
  folder: ILoadedPath[],
  path: any[],
  languageIndex: number,
): string[] => {
  const result: string[] = [];
  const realPath = getLanguagePath(path, languageIndex);

  let current: ILoadedPath[] | ILoadedPath | any = folder;
  let parentIndex: number;
  let insideParsedFile = false;

  for (let i = 0; i < realPath.length; i++) {
    if (current === undefined) {
      return result;
    }

    const pathPart = realPath[i];
    parentIndex = i === 0 ? 0 : i - 1;
    current = (current as any)[pathPart];

    if (path[parentIndex] === LANGUAGE_INDEX_SYMBOL) {
      insideParsedFile = true;
      continue;
    }

    if (insideParsedFile) {
      result.push(pathPart);
      continue;
    }

    if (typeof pathPart === 'number') {
      result.push(current.name);
    }
  }

  return result;
};

const createParsedFileTree = (
  items: IParsedFile[],
  parent: string = '',
  parentPath: any[] = [],
): ITreeItem[] => {
  const folderData = items.map(it => it.data);
  const tree = _.mergeAll.call(null, folderData as any);

  return createTreeFromObject(tree, parent, parentPath);
};

const createTreeFromObject = (
  obj: any,
  parent: string = '',
  parentPath: any[] = [],
): ITreeItem[] => {
  const keys = Object.keys(obj);

  return keys
    .map(it => {
      const id = uuid();
      const path = parentPath.concat(it);
      const isItem = typeof obj[it] === 'string';

      const item: ITreeItem = {
        id,
        parent,
        path,
        type: isItem ? 'item' : 'node',
        status: 'normal',
        label: it,
        missingCount: 0,
      };

      if (isItem) {
        return [item];
      }

      return [item].concat(createTreeFromObject(obj[it], id, path));
    })
    .flat();
};

export const getTreeItemStatus = (
  content: IContentItem[],
  originalContent: IContentItem[],
): TreeItemStatus => {
  if (isNewItem(originalContent)) {
    return 'new';
  }

  if (isMissingItem(content)) {
    return 'missing';
  }

  if (isChangedItem(content, originalContent)) {
    return 'changed';
  }

  return 'normal';
};

const isNewItem = (originalContent: IContentItem[]) =>
  originalContent.filter(it => it.value !== undefined).length === 0;

const isChangedItem = (content: IContentItem[], originalContent: IContentItem[]) =>
  _.zip(content, originalContent)
    .filter(([item, originalItem]) => item && originalItem && item.value !== originalItem.value)
    .length > 0;

const isMissingItem = (content: IContentItem[]) =>
  content.filter(it => !it.value).length > 0;
