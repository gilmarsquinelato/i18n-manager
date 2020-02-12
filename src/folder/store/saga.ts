import axios, { AxiosRequestConfig, Method } from 'axios';
import * as _ from 'lodash/fp';
import * as Redux from 'redux';
import { Action } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { CANCEL } from 'redux-saga';
import {
  call,
  cancel,
  delay,
  fork,
  put,
  select,
  spawn,
  take,
  takeLatest,
  throttle,
} from 'redux-saga/effects';
import uuid from 'uuid/v1';

import * as ipcMessages from '@common/ipcMessages';
import hashHistory from '@src/historyProvider';
import ipc, { ipcChannel } from '@src/ipcRenderer';
import { selectors as settingsSelectors } from '@src/settings/store';
import { IContextMenuOptions, ICustomSettings, ILoadedPath } from '@typings/index';
import {
  createTree,
  getContentFromPath,
  getFormattedPath,
  getLanguageLabel,
  getLanguagePath,
  getParsedFiles,
  getTreeItemStatus,
  removeTreeItem,
  updateTreeItemStatus,
  updateTreeStatus,
} from '../functions';
import { ITranslatePayload, ITranslationProgress, ITreeItem } from '../types';
import * as actions from './actions';
import * as selectors from './selectors';


// tslint:disable-next-line:max-line-length
const GOOGLE_TRANSLATE_LANGUAGES_URL = 'https://translation.googleapis.com/language/translate/v2/languages';
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

export default function* folderSaga() {
  yield spawn(listenToIpcMessages);
  yield takeLatest(actions.ACTION_TYPES.LOAD_FOLDER, sendLoadFolder);
  yield takeLatest(actions.ACTION_TYPES.OPEN_CONTEXT_MENU, sendOpenContextMenu);
  yield takeLatest(actions.ACTION_TYPES.ADD_TREE_ITEM, addTreeItem);
  yield takeLatest(actions.ACTION_TYPES.RENAME_TREE_ITEM, renameTreeItem);
  yield takeLatest(actions.ACTION_TYPES.SET_MODIFIED_CONTENT, sendModifiedContent);
  yield takeLatest(actions.ACTION_TYPES.LOAD_SUPPORTED_LANGUAGES, loadSupportedLanguages);
  yield takeLatest(actions.ACTION_TYPES.TRANSLATE, translateItems);
  yield throttle(
    1000,
    actions.ACTION_TYPES.SET_TRANSLATION_PROGRESS_THROTTLED,
    setTranslationProgress);
}

function* listenToIpcMessages() {
  yield takeLatest(ipcChannel(ipcMessages.open), receiveOpenFolder);
  yield takeLatest(ipcChannel(ipcMessages.closeFolder), receiveCloseFolder);
  yield takeLatest(ipcChannel(ipcMessages.addTreeItem), receiveAddTreeItem);
  yield takeLatest(ipcChannel(ipcMessages.renameTreeItem), receiveRenameTreeItem);
  yield takeLatest(ipcChannel(ipcMessages.removeTreeItem), receiveRemoveTreeItem);
  yield takeLatest(ipcChannel(ipcMessages.save), receiveSave);
  yield takeLatest(ipcChannel(ipcMessages.saveComplete), receiveSaveComplete);
  yield takeLatest(ipcChannel(ipcMessages.refreshFolder), receiveRefreshFolder);
}

function* sendModifiedContent(action: Action<boolean | undefined>) {
  const folder: ILoadedPath[] = yield select(selectors.folder);
  const originalFolder: ILoadedPath[] = yield select(selectors.originalFolder);
  const isChanged = action.payload !== undefined ? action.payload : !_.eq(folder, originalFolder);

  ipc.send(ipcMessages.dataChanged, isChanged);
}

function* sendLoadFolder(action: Action<string>) {
  yield put(actions.setIsLoading(true));
  ipc.send(ipcMessages.open, action.payload);
}

function sendOpenContextMenu(action: Action<IContextMenuOptions>) {
  ipc.send(ipcMessages.showContextMenu, action.payload);
}

function* receiveSave(data: any) {
  yield put(actions.setIsSaving(true));

  const folder = yield select(selectors.folder);
  ipc.send(ipcMessages.save, { data, payload: folder });
}

function* receiveSaveComplete() {
  yield put(actions.setIsSaving(false));
}

function* receiveRefreshFolder(folder: ILoadedPath[]) {
  yield put(actions.setFolder(_.cloneDeep(folder)));
  yield put(actions.setOriginalFolder(_.cloneDeep(folder)));

  const tree = yield select(selectors.tree);
  yield spawn(createTreeItemsStatus, _.cloneDeep(tree), folder);
}

function* receiveOpenFolder(folder: ILoadedPath[]) {
  const tree: ITreeItem[] = createTree(folder);

  yield put(batchActions([
    actions.setFolder(_.cloneDeep(folder)),
    actions.setOriginalFolder(_.cloneDeep(folder)),
    actions.setTree(tree),
    actions.setSelectedItem(''),
    actions.createLanguageList(),
    actions.setIsLoading(false),
    actions.setModifiedContent(false),
  ]));

  // Without this delay, redux-saga waits for the spawn finishes to propagate the changes
  yield delay(100);

  // Create items statuses and after its parents
  // Spawn is better because the status is not mandatory to show at first
  // and it's expensive in its creation
  yield spawn(createTreeItemsStatus, _.cloneDeep(tree), folder);
}

function* createTreeItemsStatus(tree: ITreeItem[], folder: ILoadedPath[]) {
  const items = tree
    .filter(it => it.type === 'item')
    .map(it => it.id);

  const newTree = tree
    .map(it => {
      if (items.includes(it.id)) {
        // The folder was just loaded, so the folder and original folder are the same
        // This initial status check is just to check the missing items
        return updateTreeItemStatus(it, folder, folder);
      }

      return it;
    });

  yield put(actions.setTree(newTree));

  // Now we can create the parents statuses
  yield spawn(createTreeParentsStatus, _.cloneDeep(newTree), folder);
}

function* createTreeParentsStatus(tree: ITreeItem[], folder: ILoadedPath[]) {
  let newTree = tree;
  const itemsParents =
    _.pipe(
      _.filter((it: ITreeItem) => it.type === 'item'),
      _.map(it => it.parent),
      _.uniq,
    )(newTree);

  for (const parent of itemsParents) {
    newTree = updateTreeStatus(newTree, folder, folder, parent);
  }

  yield put(actions.setTree(newTree));
}

function* receiveCloseFolder() {
  yield put(actions.setModifiedContent(false));
  yield put(actions.setFolder([]));
  yield put(actions.setOriginalFolder([]));
  yield put(actions.createTree([]));
  yield put(actions.createLanguageList());
  yield put(actions.cancelItemActions());
  yield put(actions.setIsLoading(false));

  hashHistory.replace('/');
}

function* receiveAddTreeItem(itemId: string) {
  yield put(actions.setAddingItemData(itemId));
}

function* receiveRenameTreeItem(itemId: string) {
  yield put(actions.setRenamingTreeItemId(itemId));
}

function* addTreeItem(action: Action<string>) {
  const addingItemData = yield select(selectors.addingItemData);
  if (!addingItemData) {
    return;
  }

  const tree: ITreeItem[] = yield select(selectors.tree);
  const parent = tree.find(it => it.id === addingItemData.itemId);
  if (!parent) {
    return;
  }

  const item = addingItemData.isNode ? {} : '';
  const path = parent.path.concat(action.payload);

  // Add item into the related files from the given path
  let folder: ILoadedPath[] = yield select(selectors.folder);
  const originalFolder: ILoadedPath[] = yield select(selectors.originalFolder);
  const files = getParsedFiles(folder, parent.path);

  for (let i = 0; i < files.length; i++) {
    const languagePath = getLanguagePath(path, i);
    folder = _.set(languagePath, item, folder);
  }

  // Add item into the tree
  const content = getContentFromPath(folder, path);
  const originalContent = getContentFromPath(originalFolder, path);

  const id = uuid();
  tree.push({
    id,
    path,
    parent: parent.id,
    type: addingItemData.isNode ? 'node' : 'item',
    status: getTreeItemStatus(content, originalContent),
    label: action.payload,
    missingCount: 0,
    untranslated: false,
  });

  // Finish action
  yield put(actions.setTree(tree));
  yield put(actions.setFolder(folder));
  yield put(actions.cancelItemActions());

  if (!addingItemData.isNode) {
    yield put(actions.setSelectedItem(id));
  }

  yield put(actions.setModifiedContent());
}

function* renameTreeItem(action: Action<string>) {
  const renamingItemId: string = yield select(selectors.renamingItemId);
  if (!renamingItemId) {
    return;
  }

  const tree: ITreeItem[] = yield select(selectors.tree);
  let item = tree.find(it => it.id === renamingItemId);
  if (!item) {
    return;
  }

  const oldPath = item.path;
  const newPath = item.path.slice(0, -1).concat(action.payload);

  // Folder path rename
  let folder: ILoadedPath[] = yield select(selectors.folder);
  const files = getParsedFiles(folder, oldPath);
  for (let i = 0; i < files.length; i++) {
    const oldLanguagePath = getLanguagePath(oldPath, i);
    const newLanguagePath = getLanguagePath(newPath, i);

    const data = _.get(oldLanguagePath, folder);
    folder = _.set(newLanguagePath, data, folder);
    folder = _.unset(oldLanguagePath, folder);
  }

  // Tree path rename
  const originalFolder: ILoadedPath[] = yield select(selectors.originalFolder);
  const content = getContentFromPath(folder, newPath);
  const originalContent = getContentFromPath(originalFolder, newPath);

  const itemIndex = tree.indexOf(item);
  item = {
    ...item,
    label: action.payload,
    path: newPath,
    status: item.type === 'item'
      ? getTreeItemStatus(content, originalContent)
      : 'normal',
  };
  tree[itemIndex] = item;

  // Finish action
  yield put(actions.setTree(tree));
  yield put(actions.setFolder(folder));
  yield put(actions.cancelItemActions());

  yield put(actions.setModifiedContent());

  // Mark new path as opened
  const itemId = item.id;
  if (tree.filter(it => it.parent === itemId).length === 0) {
    yield put(actions.setSelectedItem(itemId));
  }
}

function* receiveRemoveTreeItem(itemId: string) {
  const selectedId: string = yield select(selectors.selectedId);
  let tree: ITreeItem[] = yield select(selectors.tree);
  const item = tree.find(it => it.id === itemId);
  if (!item) {
    return;
  }

  const path = item.path;
  const parent = item.parent;

  // Folder path rename
  let folder: ILoadedPath[] = yield select(selectors.folder);
  const files = getParsedFiles(folder, path);
  for (let i = 0; i < files.length; i++) {
    const languagePath = getLanguagePath(path, i);
    folder = _.unset(languagePath, folder);
  }

  tree = removeTreeItem(tree, item);

  const originalFolder: ILoadedPath[] = yield select(selectors.originalFolder);
  tree = updateTreeStatus(tree, folder, originalFolder, parent);

  // Finish action
  yield put(actions.setTree(tree));
  yield put(actions.setFolder(folder));

  yield put(actions.setModifiedContent());

  if (selectedId === itemId) {
    yield put(actions.setSelectedItem(''));
  }
}

function* setTranslationProgress(action: Action<ITranslationProgress>) {
  yield put(actions.setTranslationProgress(action.payload));
}

function* loadSupportedLanguages() {
  const settings = yield select(settingsSelectors.settings);
  const googleTranslateApiKey = settings.googleTranslateApiKey;

  if (!googleTranslateApiKey || googleTranslateApiKey.length === 0) {
    return;
  }

  const supportedLanguagesResponse = yield call(
    fetchAPI,
    `${GOOGLE_TRANSLATE_LANGUAGES_URL}?key=${googleTranslateApiKey}`,
    'GET',
  );

  const supportedLanguages =
    (_.getOr([], 'data.data.languages', supportedLanguagesResponse) as any[])
      .map((it: any) => it.language);

  yield put(actions.setSupportedLanguages(supportedLanguages));
}

function* translateItems(action: Action<ITranslatePayload>) {
  const task = yield fork(startTranslate, action);
  yield take(actions.ACTION_TYPES.CANCEL_TRANSLATE);
  yield cancel(task);
}

function* startTranslate({ payload }: Action<ITranslatePayload>) {
  const settings: ICustomSettings = yield select(settingsSelectors.settings);
  const googleTranslateApiKey = settings.googleTranslateApiKey;

  const tree: ITreeItem[] = yield select(selectors.tree);
  const folder: ILoadedPath[] = yield select(selectors.folder);
  const selectedItem: ITreeItem = yield select(selectors.selectedItem);

  const items = payload.mode === 'this' && selectedItem
    ? [selectedItem]
    : tree.filter(it => it.type === 'item');

  const baseItemTime = 50; // Mean response time of google translate in a normal connection
  const total = items.length * payload.targetLanguages.length;

  const progress: ITranslationProgress = {
    total,
    current: 0,
    path: [],
    language: '',
    estimatedTimeInMs: total * baseItemTime,
  };

  const updateValueActions: Redux.AnyAction[] = [];

  yield put(actions.setTranslationProgress(progress));
  yield put(actions.setTranslationErrors([]));

  // Necessary to propagate previous puts before show the translation modal
  yield delay(200);

  yield put(actions.setIsTranslating(true));

  // Necessary to not freeze the UI
  yield delay(500);

  function* increaseProgressCurrent() {
    progress.current++;
    yield put(actions.setTranslationProgressThrottled(_.clone(progress)));
  }

  function* setProgressCurrent(value: number) {
    progress.current = value;
    yield put(actions.setTranslationProgressThrottled(_.clone(progress)));
  }

  let lastItemTime = baseItemTime;
  for (let index = 0; index < items.length; index++) {
    // Adjust the progress bar
    // if is there previous unsuccessful/skipped items
    const currentProgress = index * payload.targetLanguages.length;
    yield call(setProgressCurrent, currentProgress);

    progress.estimatedTimeInMs = (progress.total - currentProgress) * lastItemTime;
    yield put(actions.setTranslationProgressThrottled(_.clone(progress)));

    const item = items[index];
    const parsedFiles = getParsedFiles(folder, item.path);

    const source = parsedFiles.find(it => it.language === payload.sourceLanguage);

    // Get the first filled formatted path
    // This is because some indexes may not have the given path
    let formattedPath: string[] = [];
    for (let i = 0; i < parsedFiles.length; i++) {
      formattedPath = getFormattedPath(folder, item.path, i);
      if (formattedPath.length > 0) {
        break;
      }
    }

    if (!source) {
      // yield call(increaseProgressCurrent);
      yield put(actions.addTranslationError({
        path: formattedPath,
        error: TRANSLATE_ERRORS.noSourceLanguage(payload.sourceLanguage),
      }));
      continue;
    }

    const sourceIndex = parsedFiles.indexOf(source);
    const sourceText = _.get(getLanguagePath(item.path, sourceIndex), folder) as unknown as string;

    progress.path = formattedPath;

    if (!sourceText || sourceText.length === 0) {
      // yield call(increaseProgressCurrent);
      yield put(actions.addTranslationError({
        path: formattedPath,
        error: TRANSLATE_ERRORS.emptySourceField(payload.sourceLanguage),
      }));
      continue;
    }

    for (let parsedFileIndex = 0; parsedFileIndex < parsedFiles.length; parsedFileIndex++) {
      const currentFile = parsedFiles[parsedFileIndex];
      if (!currentFile || !payload.targetLanguages.includes(currentFile.language)) {
        continue;
      }

      progress.language = getLanguageLabel(currentFile.language);
      yield put(actions.setTranslationProgressThrottled(progress));

      if (parsedFileIndex === sourceIndex) {
        continue;
      }

      const text = _.get(getLanguagePath(item.path, parsedFileIndex), folder) as unknown as string;
      if (text && text.length > 0 && !payload.overwrite) {
        continue;
      }

      // Doing this at this point instead of the start of the loop
      // will avoid to dispatch a lot of sagas
      yield call(increaseProgressCurrent);

      const start = new Date().getTime();
      const result = yield call(
        translate,
        sourceText,
        source.language,
        currentFile.language,
        formattedPath,
        googleTranslateApiKey,
      );
      const end = new Date().getTime();
      lastItemTime = end - start;

      if (typeof result === 'string') {
        updateValueActions.push(
          actions.setPathValue({
            index: parsedFileIndex,
            value: result,
            itemId: item.id,
          }),
          actions.updateTreeItemStatus(item.id),
        );
      } else if (result) {
        yield put(actions.addTranslationError(result));
      }
    }
  }

  progress.current = progress.total;
  yield put(actions.setTranslationProgressThrottled(_.cloneDeep(progress)));
  yield put(batchActions(updateValueActions));
  yield put(actions.setModifiedContent());
}

function* translate(
  text: string,
  source: string,
  target: string,
  path: string[],
  googleTranslateApiKey: string,
) {
  // Google translate doesn't support localized languages
  const targetLanguage = target.split('-')[0];
  const sourceLanguage = source.split('-')[0];

  if (targetLanguage === sourceLanguage) {
    return;
  }

  try {
    const response = yield call(
      fetchAPI,
      `${GOOGLE_TRANSLATE_URL}?key=${googleTranslateApiKey}`,
      'POST',
      {
        target: targetLanguage,
        source: sourceLanguage,
        q: text,
        format: 'text',
      },
    );

    if (response.status === 200) {
      return getGoogleTranslateText(response.data);
    }

    return {
      path,
      // tslint:disable-next-line:max-line-length
      error: TRANSLATE_ERRORS.genericGoogleTranslateError(sourceLanguage, targetLanguage),
    };
  } catch (e) {
    const errorMessage = _.getOr(e.message, 'response.data.error.message', e);

    return {
      path,
      error: TRANSLATE_ERRORS.googleTranslateError(errorMessage, sourceLanguage, targetLanguage),
    };
  }
}

const getGoogleTranslateText = (response: any) =>
  _.get('data.translations[0].translatedText', response);

function fetchAPI(url: string, method?: Method, data?: any, config?: AxiosRequestConfig) {
  const source = axios.CancelToken.source();
  const requestConfig: AxiosRequestConfig = {
    ...config,
    url,
    method,
    data,
    cancelToken: source.token,
  };

  const request = axios(requestConfig);
  (request as any)[CANCEL] = () => source.cancel();
  return request;
}

const TRANSLATE_ERRORS = {
  // tslint:disable-next-line:max-line-length
  noSourceLanguage: (sourceLanguage: string) => `Couldn't translate because this item doesn't have the source language "${getLanguageLabel(sourceLanguage)}"`,
  // tslint:disable-next-line:max-line-length
  emptySourceField: (sourceLanguage: string) => `Couldn't translate because the field of the source language "${getLanguageLabel(sourceLanguage)}" is empty`,
  genericGoogleTranslateError: (sourceLanguage: string, targetLanguage: string) =>
    // tslint:disable-next-line:max-line-length
    `Google Translate can't translate from "${getLanguageLabel(sourceLanguage)}" to "${getLanguageLabel(targetLanguage)}"`,
  googleTranslateError: (errorMessage: string, sourceLanguage: string, targetLanguage: string) =>
    // tslint:disable-next-line:max-line-length
    `Google Translate error: "${errorMessage}"\n translating from "${getLanguageLabel(sourceLanguage)}" to "${getLanguageLabel(targetLanguage)}"`,
};
