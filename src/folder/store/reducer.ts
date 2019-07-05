import _ from 'lodash/fp';
import { Action, handleActions, ReducerMapValue } from 'redux-actions';

import { getLocale } from '@common/language';
import { defaultSetReducer } from '@src/store/functions';
import {
  createTree,
  getLanguageLabel,
  getLanguagePath,
  getParsedFiles,
  updateTreeStatus,
} from '../functions';
import { IChangeFolderValuePayload, ITreeItem } from '../types';
import { ACTION_TYPES } from './actions';
import { IFolderState } from './types';


const initialState: IFolderState = {
  originalFolder: [],
  folder: [],
  folderPath: '',
  isLoading: false,
  isSaving: false,
  tree: [],
  selectedId: '',
  selectedItem: undefined,
  addingItemData: undefined,
  renamingItemId: undefined,
  languageList: [],
  allLanguages: [],
  supportedLanguages: [],
  isTranslating: false,
  translationProgress: {
    path: [],
    language: '',
    total: 10,
    current: 0,
    estimatedTimeInMs: 0,
  },
  translationErrors: [],
};

const setPathValue: ReducerFunction = (state, {payload}: Action<IChangeFolderValuePayload>) => {
  const item = state.tree.find(it => it.id === payload.itemId);
  if (!item) {
    return state;
  }

  const path = getLanguagePath(item.path, payload.index);
  return _.set(['folder', ...path], payload.value, state);
};

const createLanguageList: ReducerFunction = (state) => {
  const languageList =
    _.pipe(
      // get from tree the file items
      _.filter((it: ITreeItem) => it.type === 'file'),
      // get the parsed files for each item
      _.flatMap(it => getParsedFiles(state.folder, it.path)),
      // get only items with valid language names
      _.filter(it => getLocale(it.language) !== undefined),
      _.map(it => ({
        language: it.language,
        label: getLanguageLabel(it.language),
      })),
      // unique languages
      _.uniqBy(it => it.language),
      _.sortBy(it => it.language),
    )(state.tree);

  return {
    ...state,
    languageList,
    allLanguages: languageList.map(it => it.language),
  };
};

export default handleActions<IFolderState, any>({
  [ACTION_TYPES.SET_IS_LOADING]: defaultSetReducer<IFolderState>('isLoading'),
  [ACTION_TYPES.SET_IS_SAVING]: defaultSetReducer<IFolderState>('isSaving'),
  [ACTION_TYPES.SET_FOLDER]: defaultSetReducer<IFolderState>('folder'),
  [ACTION_TYPES.SET_ORIGINAL_FOLDER]: defaultSetReducer<IFolderState>('originalFolder'),
  [ACTION_TYPES.SET_ADDING_TREE_ITEM_DATA]: defaultSetReducer<IFolderState>('addingItemData'),
  [ACTION_TYPES.SET_RENAMING_TREE_ITEM_ID]: defaultSetReducer<IFolderState>('renamingItemId'),
  [ACTION_TYPES.SET_IS_TRANSLATING]: defaultSetReducer<IFolderState>('isTranslating'),
  [ACTION_TYPES.SET_TRANSLATION_ERRORS]: defaultSetReducer<IFolderState>('translationErrors'),
  [ACTION_TYPES.SET_SUPPORTED_LANGUAGES]: defaultSetReducer<IFolderState>('supportedLanguages'),

  [ACTION_TYPES.CREATE_LANGUAGE_LIST]: createLanguageList,
  [ACTION_TYPES.SET_PATH_VALUE]: setPathValue,

  [ACTION_TYPES.SET_TRANSLATION_PROGRESS]: (state, {payload}) => ({
    ...state,
    translationProgress: _.clone(payload),
  }),
  [ACTION_TYPES.SET_TREE]: (state, {payload}) => ({
    ...state,
    tree: _.cloneDeep(payload),
  }),
  [ACTION_TYPES.ADD_TRANSLATION_ERROR]:
    (state, {payload}) => ({
      ...state,
      translationErrors: state.translationErrors.concat(payload),
    }),
  [ACTION_TYPES.CANCEL_TRANSLATE]:
    state => ({
      ...state,
      isTranslating: false,
      translationProgress: {path: [], language: '', total: 10, current: 0},
      translationErrors: [],
    }),
  [ACTION_TYPES.CREATE_TREE]:
    (state, {payload}) => ({
      ...state,
      tree: createTree(payload),
    }),
  [ACTION_TYPES.SET_SELECTED_ITEM]:
    (state, {payload}: any) => ({
      ...state,
      selectedId: payload,
      selectedItem: state.tree.find(it => it.id === payload as string),
    }),
  [ACTION_TYPES.CANCEL_ITEM_ACTIONS]:
    state => ({
      ...state,
      addingItemData: undefined,
      renamingItemId: undefined,
    }),
  [ACTION_TYPES.UPDATE_TREE_ITEM_STATUS]:
    (state, {payload}) => ({
      ...state,
      tree: updateTreeStatus(
        state.tree,
        state.folder,
        state.originalFolder,
        payload,
      ),
    }),
}, initialState);

type ReducerFunction = ReducerMapValue<IFolderState, any>;
