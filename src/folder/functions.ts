import * as _ from 'lodash';
import { ParsedFile } from '../../typings';


export const isNode = (tree: any, path: string[]) =>
  typeof _.get(tree, path) === 'string';

export const isContentChanged = (folder: ParsedFile[], originalFolder: ParsedFile[]) =>
  !_.isEqual(folder, originalFolder);

export const walkOnTree = (
  tree: any,
  path: string[] = [],
  fn: (path: string[], hasChildren: boolean) => void,
) => {
  const treeKeys = path.length === 0
    ? Object.keys(tree)
    : Object.keys(_.get(tree, path));

  for (const key of treeKeys) {
    const currentPath = path.concat(key);

    if (typeof _.get(tree, currentPath) === 'string') {
      fn(currentPath, false);
    } else {
      walkOnTree(tree, currentPath, fn);
      fn(currentPath, true);
    }
  }
};

export const getTreeItemStatus = (folder: ParsedFile[], originalFolder: ParsedFile[], path: string[]): string => {
  if (isNewItem(folder, originalFolder, path)) {
    return 'new';
  }

  if (isMissingItem(folder, path)) {
    return 'missing';
  }

  if (isChangedItem(folder, originalFolder, path)) {
    return 'changed';
  }

  return '';
};

const isNewItem = (folder: ParsedFile[], originalFolder: ParsedFile[], path: string[]) =>
  folder.reduce((acc, curr) => {
      const original = getOriginalFromLanguage(originalFolder, curr.language);
      if (!original) {
        return acc;
      }

      return acc && (
        _.get(curr.data, path) !== undefined &&
        _.get(original.data, path) === undefined
      );
    },
    true
  );

const isChangedItem = (folder: ParsedFile[], originalFolder: ParsedFile[], path: string[]) =>
  folder.reduce((acc, curr) => {
      const original = getOriginalFromLanguage(originalFolder, curr.language);
      if (!original) {
        return acc;
      }

      return acc || _.get(curr.data, path) !== _.get(original.data, path);
    },
    false
  );

const isMissingItem = (folder: ParsedFile[], path: string[]) =>
  folder.reduce(
    (acc, curr) => acc ||
      !_.get(curr.data, path),
    false
  );

const getOriginalFromLanguage = (originalFolder: ParsedFile[], language: string) =>
  originalFolder.find(i => i.language === language);

