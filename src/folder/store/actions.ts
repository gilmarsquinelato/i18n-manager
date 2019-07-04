import { createAction } from 'redux-actions';

import { IContextMenuOptions, ILoadedPath } from '@typings/index';
import {
  IChangeFolderValuePayload,
  ITranslatePayload,
  ITranslationError,
  ITranslationProgress, ITreeItem,
} from '../types';


const namespace = 'i18n/folder';

export const ACTION_TYPES = {
  LOAD_FOLDER: `${namespace}/LOAD_FOLDER`,
  SET_SELECTED_ITEM: `${namespace}/SET_SELECTED_ITEM`,
  SET_FOLDER: `${namespace}/SET_FOLDER`,
  SET_ORIGINAL_FOLDER: `${namespace}/SET_ORIGINAL_FOLDER`,
  CREATE_TREE: `${namespace}/CREATE_TREE`,
  SET_TREE: `${namespace}/SET_TREE`,
  CREATE_TREE_STATUS: `${namespace}/CREATE_TREE_STATUS`,
  CREATE_LANGUAGE_LIST: `${namespace}/CREATE_LANGUAGE_LIST`,
  SET_IS_LOADING: `${namespace}/SET_IS_LOADING`,
  SET_IS_SAVING: `${namespace}/SET_IS_SAVING`,
  SET_MODIFIED_CONTENT: `${namespace}/SET_MODIFIED_CONTENT`,
  CANCEL_ITEM_ACTIONS: `${namespace}/CANCEL_ITEM_ACTIONS`,
  SET_PATH_VALUE: `${namespace}/SET_PATH_VALUE`,
  OPEN_CONTEXT_MENU: `${namespace}/OPEN_CONTEXT_MENU`,
  SET_ADDING_TREE_ITEM_DATA: `${namespace}/SET_ADDING_TREE_ITEM_DATA`,
  ADD_TREE_ITEM: `${namespace}/ADD_TREE_ITEM`,
  SET_RENAMING_TREE_ITEM_ID: `${namespace}/SET_RENAMING_TREE_ITEM_ID`,
  RENAME_TREE_ITEM: `${namespace}/RENAME_TREE_ITEM`,
  UPDATE_TREE_ITEM_STATUS: `${namespace}/UPDATE_TREE_ITEM_STATUS`,
  TRANSLATE: `${namespace}/TRANSLATE`,
  CANCEL_TRANSLATE: `${namespace}/CANCEL_TRANSLATE`,
  SET_IS_TRANSLATING: `${namespace}/SET_IS_TRANSLATING`,
  SET_TRANSLATION_PROGRESS: `${namespace}/SET_TRANSLATION_PROGRESS`,
  SET_TRANSLATION_PROGRESS_THROTTLED: `${namespace}/SET_TRANSLATION_PROGRESS_THROTTLED`,
  SET_TRANSLATION_ERRORS: `${namespace}/SET_TRANSLATION_ERRORS`,
  ADD_TRANSLATION_ERROR: `${namespace}/ADD_TRANSLATION_ERROR`,
  LOAD_SUPPORTED_LANGUAGES: `${namespace}/LOAD_SUPPORTED_LANGUAGES`,
  SET_SUPPORTED_LANGUAGES: `${namespace}/SET_SUPPORTED_LANGUAGES`,
};

export const loadFolder = createAction<string>(ACTION_TYPES.LOAD_FOLDER);
export const setSelectedItem = createAction<string>(ACTION_TYPES.SET_SELECTED_ITEM);
export const setFolder = createAction<ILoadedPath[]>(ACTION_TYPES.SET_FOLDER);
export const setOriginalFolder =
  createAction<ILoadedPath[]>(ACTION_TYPES.SET_ORIGINAL_FOLDER);
export const createTree = createAction<ILoadedPath[]>(ACTION_TYPES.CREATE_TREE);
export const setTree = createAction<ITreeItem[]>(ACTION_TYPES.SET_TREE);
export const createLanguageList = createAction(ACTION_TYPES.CREATE_LANGUAGE_LIST);
export const setIsLoading = createAction<boolean>(ACTION_TYPES.SET_IS_LOADING);
export const setIsSaving = createAction<boolean>(ACTION_TYPES.SET_IS_SAVING);
export const setModifiedContent = createAction<boolean | void>(ACTION_TYPES.SET_MODIFIED_CONTENT);
export const cancelItemActions = createAction(ACTION_TYPES.CANCEL_ITEM_ACTIONS);
export const setPathValue = createAction<IChangeFolderValuePayload>(ACTION_TYPES.SET_PATH_VALUE);
export const openContextMenu = createAction<IContextMenuOptions>(ACTION_TYPES.OPEN_CONTEXT_MENU);
export const setAddingItemData = createAction<string>(ACTION_TYPES.SET_ADDING_TREE_ITEM_DATA);
export const addTreeItem = createAction<string>(ACTION_TYPES.ADD_TREE_ITEM);
export const setRenamingTreeItemId = createAction<string>(ACTION_TYPES.SET_RENAMING_TREE_ITEM_ID);
export const renameTreeItem = createAction<string>(ACTION_TYPES.RENAME_TREE_ITEM);
export const updateTreeItemStatus = createAction<string>(ACTION_TYPES.UPDATE_TREE_ITEM_STATUS);
export const translate = createAction<ITranslatePayload>(ACTION_TYPES.TRANSLATE);
export const cancelTranslate = createAction(ACTION_TYPES.CANCEL_TRANSLATE);
export const setIsTranslating = createAction<boolean>(ACTION_TYPES.SET_IS_TRANSLATING);
export const setTranslationErrors =
  createAction<ITranslationError[]>(ACTION_TYPES.SET_TRANSLATION_ERRORS);
export const addTranslationError =
  createAction<ITranslationError>(ACTION_TYPES.ADD_TRANSLATION_ERROR);
export const setTranslationProgress =
  createAction<ITranslationProgress>(ACTION_TYPES.SET_TRANSLATION_PROGRESS);
export const setTranslationProgressThrottled =
  createAction<ITranslationProgress>(ACTION_TYPES.SET_TRANSLATION_PROGRESS_THROTTLED);
export const loadSupportedLanguages = createAction(ACTION_TYPES.LOAD_SUPPORTED_LANGUAGES);
export const setSupportedLanguages = createAction<string[]>(ACTION_TYPES.SET_SUPPORTED_LANGUAGES);
