import { ContentItem } from '../types';
import { getLanguagePath, LANGUAGE_INDEX_SYMBOL } from './language';
import { LoadedPath, ParsedFile } from '@common/types';
import * as _ from 'lodash/fp';

export const getContentFromPath = (folder: LoadedPath[], path: any[]): ContentItem[] => {
  const parsedFiles = getParsedFiles(folder, path);

  return parsedFiles.map((item, index) => ({
    language: item.language,
    languageIndex: index,
    value: _.get(getLanguagePath(path, index), folder) as any,
  }));
};

const getLanguageIndex = (path: any[]) => path.indexOf(LANGUAGE_INDEX_SYMBOL);

export const getLanguageCount = (items: LoadedPath[], path: any[]): number => {
  return getParsedFiles(items, path).length;
};

export const getParsedFiles = (items: LoadedPath[], path: any[]): ParsedFile[] => {
  const parentPath = path.slice(0, getLanguageIndex(path));
  return (_.getOr([], parentPath, items) as unknown) as ParsedFile[];
};

export const getFormattedPath = (
  folder: LoadedPath[],
  path: any[],
  languageIndex: number,
): string[] => {
  const result: string[] = [];
  const realPath = getLanguagePath(path, languageIndex);

  let current: LoadedPath[] | LoadedPath | any = folder;
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

    if (typeof pathPart === 'number' && current.name) {
      result.push(current.name);
    }
  }

  return result;
};

export const renameItem = (items: LoadedPath[], oldPath: any[], newPath: any[]): LoadedPath[] => {
  const languageIndex = getLanguageIndex(oldPath);
  const languageCount = getLanguageCount(items, oldPath);

  let newItems = items;

  for (let i = 0; i < languageCount; i++) {
    const oldPathCopy = oldPath.slice();
    const newPathCopy = newPath.slice();

    oldPathCopy[languageIndex] = newPathCopy[languageIndex] = i;

    const value = _.get(oldPathCopy, items);

    newItems = _.set(newPathCopy, value, newItems);
    newItems = _.unset(oldPathCopy, newItems);
  }

  return newItems;
};

export const addItem = (
  items: LoadedPath[],
  path: any[],
  label: string,
  isItem: boolean,
): LoadedPath[] => {
  const languageIndex = getLanguageIndex(path);
  const languageCount = getLanguageCount(items, path);

  let newItems = items;

  const item = isItem ? '' : {};

  for (let i = 0; i < languageCount; i++) {
    const pathCopy = path.slice();

    pathCopy[languageIndex] = i;

    newItems = _.set(pathCopy, item, newItems);
  }

  return newItems;
};

export const deleteItem = (items: LoadedPath[], path: any[]): LoadedPath[] => {
  const languageIndex = getLanguageIndex(path);
  const languageCount = getLanguageCount(items, path);

  let newItems = items;

  for (let i = 0; i < languageCount; i++) {
    const pathCopy = path.slice();

    pathCopy[languageIndex] = i;

    newItems = _.unset(pathCopy, newItems);
  }

  return newItems;
};

export const pasteItem = (items: LoadedPath[], oldPath: any[], newPath: any[]): LoadedPath[] => {
  const oldLanguageIndex = getLanguageIndex(oldPath);
  const newLanguageIndex = getLanguageIndex(newPath);

  const oldPathLanguages = getParsedFiles(items, oldPath).map(it => it.language);
  const newPathLanguages = getParsedFiles(items, newPath).map(it => it.language);

  let newItems = items;

  for (let i = 0; i < newPathLanguages.length; i++) {
    const oldPathCopy = oldPath.slice();
    const newPathCopy = newPath.slice();

    const newPathLanguage = newPathLanguages[i];
    newPathCopy[newLanguageIndex] = i;

    oldPathCopy[oldLanguageIndex] = oldPathLanguages.indexOf(newPathLanguage);

    let value = _.get(oldPathCopy, items);
    // Fallback to the first language found
    if (!value) {
      oldPathCopy[oldLanguageIndex] = 0;
      value = _.get(oldPathCopy, items);
    }

    newItems = _.set(newPathCopy, value, newItems);
  }

  return newItems;
};
