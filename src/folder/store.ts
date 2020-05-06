import router from '@/router';
import { sendIpc } from '@/store/plugins/ipc';
import * as ipcMessages from '@common/ipcMessages';
import { LoadedPath } from '@common/types';
import axios, { CancelTokenSource } from 'axios';
import deepEqual from 'fast-deep-equal';
import _ from 'lodash/fp';
import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import {
  AddItemPayload,
  ChangeFolderValuePayload,
  ClipboardItemAction,
  DeleteItemPayload,
  LanguageListItem,
  PasteItemPayload,
  RenameItemPayload,
  SetClipboardPayload,
  TranslatePayload,
  TranslationError,
  TranslationProgress,
  TreeItem,
  TreeMap,
} from './types';
import { addItem, deleteItem, pasteItem, renameItem } from './utils/files';
import { createLanguageList, getLanguageLabel, getLanguagePath } from './utils/language';
import { getTranslationItems, translate } from './utils/translate';
import { createTree, createTreeStatus, pathToString, updateTreeStatus } from './utils/tree';

const GOOGLE_TRANSLATE_LANGUAGES_URL =
  'https://translation.googleapis.com/language/translate/v2/languages';

@Module({
  namespaced: true,
})
export default class FolderModule extends VuexModule {
  tree: TreeMap = {};
  folder: LoadedPath[] = [];
  originalFolder: LoadedPath[] = [];
  selectedItem: TreeItem | null = null;
  modifiedContent = false;
  languageList: LanguageListItem[] = [];

  isTranslationEnabled = false;
  isTranslating = false;
  translationProgress: TranslationProgress | null = null;
  translationErrors: TranslationError[] = [];
  cancelToken: CancelTokenSource | null = null;

  clipboardItemId: string | null = null;
  clipboardItemAction: ClipboardItemAction | null = null;

  isSaving = false;

  get treeItems() {
    return Object.values(this.tree);
  }

  @Action
  async closeFolder() {
    await router.push('/');

    const { commit, dispatch } = this.context;

    commit('setTree', {});
    commit('setFolder', []);
    commit('setOriginalFolder', []);
    commit('setSelectedItem', null);
    commit('setModifiedContent', false);
    commit('setClipboard', { item: null, action: null });
    await dispatch('sendModifiedContent');
  }

  @Action
  async openFolder(folder: LoadedPath[]) {
    const { commit, dispatch } = this.context;

    commit('setFolder', _.cloneDeep(folder));
    commit('setOriginalFolder', _.cloneDeep(folder));

    // Hack to retrieve pure object instead the Observer one
    let tree = Object.assign({}, this.tree);
    createTree(tree, folder);

    // Sort it
    tree = _.pipe(
      Object.entries,
      _.sortBy(([id]) => id),
      Object.fromEntries,
    )(tree);

    // we display the tree without any statuses
    commit('setTree', tree);
    // after we update the status
    // since this second part takes a longer time
    createTreeStatus(tree, folder, folder);
    commit('setTree', tree);

    await dispatch('createLanguageList');
    await dispatch('sendModifiedContent');
  }

  @Action
  async refreshFolder(folder: LoadedPath[]) {
    await this.context.dispatch('openFolder', folder);
  }

  @Action
  async save(data: any) {
    this.context.commit('setIsSaving', true);
    sendIpc(ipcMessages.save, { data, payload: this.folder });
  }

  @Action
  async saveComplete(data: any) {
    this.context.commit('setIsSaving', false);
  }

  @Action
  sendModifiedContent() {
    sendIpc(ipcMessages.dataChanged, this.modifiedContent);
  }

  @Action
  async refreshTranslationKey() {
    if (this.folder.length === 0) return;

    await this.context.dispatch('createLanguageList');
  }

  @Action
  async createLanguageList() {
    const { googleTranslateApiKey } = this.context.rootState.settings.settings;

    let supportedLanguages: string[] = [];
    if (googleTranslateApiKey) {
      try {
        const supportedLanguagesResponse = await fetch(
          `${GOOGLE_TRANSLATE_LANGUAGES_URL}?key=${googleTranslateApiKey}`,
        );
        const supportedLanguagesBody = await supportedLanguagesResponse.json();

        supportedLanguages = _.get('data.languages', supportedLanguagesBody).map(
          (it: any) => it.language,
        );
        this.context.commit('setTranslationEnabled', true);
      } catch (e) {
        this.context.commit('setTranslationEnabled', false);
      }
    }

    const languageList = createLanguageList(this.tree, this.folder, supportedLanguages);

    this.context.commit('setLanguageList', languageList);
  }

  @Mutation
  setIsSaving(isSaving: boolean) {
    this.isSaving = isSaving;
  }

  @Mutation
  setFolder(folder: LoadedPath[]) {
    this.folder = folder;
    this.modifiedContent = !deepEqual(this.folder, this.originalFolder);
  }

  @Mutation
  setOriginalFolder(folder: LoadedPath[]) {
    this.originalFolder = folder;
    this.modifiedContent = !deepEqual(this.folder, this.originalFolder);
  }

  @Mutation
  setTree(tree: TreeMap) {
    this.tree = tree;
  }

  @Mutation
  setSelectedItem(item: TreeItem) {
    this.selectedItem = item;
  }

  @Mutation
  updateValue(payload: ChangeFolderValuePayload) {
    const itemPath = this.tree[payload.itemId].path;

    const path = getLanguagePath(itemPath, payload.index);
    this.folder = _.set(path, payload.value, this.folder);

    this.modifiedContent = !deepEqual(this.folder, this.originalFolder);
  }

  @Mutation
  updateTreeStatus() {
    if (!this.selectedItem) return;

    updateTreeStatus(this.tree, this.folder, this.originalFolder, this.selectedItem.id);
  }

  @Mutation
  updateTreeItemStatus(itemId: string) {
    if (!itemId) return;

    updateTreeStatus(this.tree, this.folder, this.originalFolder, itemId);
  }

  @Mutation
  setModifiedContent(modifiedContent: boolean) {
    this.modifiedContent = modifiedContent;
  }

  @Mutation
  setTranslationEnabled(enabled: boolean) {
    this.isTranslationEnabled = enabled;
  }

  @Mutation
  setLanguageList(languageList: LanguageListItem[]) {
    this.languageList = languageList;
  }

  @Action
  async cancelTranslate() {
    this.cancelToken?.cancel();
  }

  @Action
  async translate(payload: TranslatePayload) {
    const { commit, dispatch } = this.context;
    const { googleTranslateApiKey } = this.context.rootState.settings.settings;

    const tree = Object.assign({}, this.tree);
    const folder = this.folder;

    const items =
      payload.mode === 'this' && this.selectedItem
        ? [this.selectedItem]
        : Object.values(tree).filter(it => it.type === 'item');

    commit('setTranslationErrors', []);
    const translationItems = getTranslationItems(commit, folder, items, payload);

    const progress: TranslationProgress = {
      total: translationItems.length,
      current: 0,
      path: [],
      language: '',
      estimatedTimeInMs: 0,
    };

    const updateProgress = _.throttle(1000, () => commit('setTranslationProgress', progress));

    updateProgress();
    commit('createTranslationCancelToken');
    commit('setIsTranslating', true);

    let totalTime = 0;
    for (let index = 0; index < translationItems.length; index++) {
      const item = translationItems[index];

      // Adjust the progress bar
      progress.current = index + 1;

      progress.path = item.formattedPath;
      progress.language = getLanguageLabel(item.targetLanguage);

      updateProgress();

      try {
        const start = new Date().getTime();
        const result = await translate(
          item.sourceText,
          item.sourceLanguage,
          item.targetLanguage,
          item.formattedPath,
          googleTranslateApiKey,
          this.cancelToken!,
        );
        const end = new Date().getTime();
        totalTime += end - start;

        const meanTime = totalTime / progress.current;
        progress.estimatedTimeInMs = (progress.total - progress.current) * meanTime;

        if (typeof result === 'string') {
          commit('updateValue', {
            index: item.index,
            value: result,
            itemId: item.itemId,
          } as ChangeFolderValuePayload);

          commit('updateTreeItemStatus', item.itemId);
        } else if (result) {
          commit('addTranslationError', result);
        }
      } catch (e) {
        // Request was cancelled
        commit('setIsTranslating', false);
        break;
      }
    }

    updateProgress();
    await dispatch('sendModifiedContent');

    if (this.translationErrors.length === 0) {
      setTimeout(() => {
        commit('setIsTranslating', false);
      }, 500);
    }
  }

  @Mutation
  createTranslationCancelToken() {
    this.cancelToken = axios.CancelToken.source();
  }

  @Mutation
  setIsTranslating(isTranslating: boolean) {
    this.isTranslating = isTranslating;
  }

  @Mutation
  setTranslationProgress(progress: TranslationProgress) {
    this.translationProgress = progress;
  }

  @Mutation
  setTranslationErrors(errors: TranslationError[]) {
    this.translationErrors = errors;
  }

  @Mutation
  addTranslationError(error: TranslationError) {
    this.translationErrors.push(error);
  }

  @Mutation
  deleteItem({ item }: DeleteItemPayload) {
    this.folder = deleteItem(this.folder, item.path);

    // Hack to retrieve pure object instead the Observer one
    let tree = Object.assign({}, this.tree);

    tree = _.pipe(
      Object.entries,
      // Remove the removed item and its children
      _.filter(([id]) => id !== item.id && !id.startsWith(`${item.id}.`)),
      _.sortBy(([id]) => id),
      Object.fromEntries,
    )(tree);

    this.tree = tree;
    this.modifiedContent = true;

    if (this.selectedItem?.id === item.id) {
      this.selectedItem = null;
    }
  }

  @Mutation
  addItem({ parent, label, isItem }: AddItemPayload) {
    const path = parent.path.slice();
    path.push(label);

    this.folder = addItem(this.folder, path, label, isItem);

    // Hack to retrieve pure object instead the Observer one
    let tree = Object.assign({}, this.tree);

    createTree(tree, this.folder);

    tree = _.pipe(
      Object.entries,
      _.sortBy(([id]) => id),
      Object.fromEntries,
    )(tree);

    const newId = pathToString(path);
    updateTreeStatus(tree, this.folder, this.originalFolder, newId);

    this.tree = tree;
    this.modifiedContent = true;

    if (isItem) {
      this.selectedItem = tree[newId];
    }
  }

  @Mutation
  renameItem({ item, label }: RenameItemPayload) {
    const newPath = item.path.slice();
    newPath.pop();
    newPath.push(label);

    this.folder = renameItem(this.folder, item.path, newPath);

    // Hack to retrieve pure object instead the Observer one
    let tree = Object.assign({}, this.tree);

    createTree(tree, this.folder);

    tree = _.pipe(
      Object.entries,
      // Remove the old item and its children
      _.filter(([id]) => id !== item.id && !id.startsWith(`${item.id}.`)),
      _.sortBy(([id]) => id),
      Object.fromEntries,
    )(tree);

    const newId = pathToString(newPath);
    updateTreeStatus(tree, this.folder, this.originalFolder, newId);

    this.tree = tree;
    this.modifiedContent = true;
    if (tree[newId].type === 'item') {
      this.selectedItem = tree[newId];
    }
  }

  @Mutation
  setClipboard({ item, action }: SetClipboardPayload) {
    if (!item) {
      this.clipboardItemId = null;
      this.clipboardItemAction = null;
      return;
    }

    this.clipboardItemId = item.id;
    this.clipboardItemAction = action;
  }

  @Mutation
  pasteItem({ parent, label }: PasteItemPayload) {
    if (!this.clipboardItemId) return;

    const item = this.tree[this.clipboardItemId];

    const newPath = parent.path.slice();
    newPath.push(label);

    this.folder = pasteItem(this.folder, item.path, newPath);

    // Hack to retrieve pure object instead the Observer one
    let tree = Object.assign({}, this.tree);

    if (this.clipboardItemAction === ClipboardItemAction.cut) {
      this.folder = deleteItem(this.folder, item.path);

      tree = _.pipe(
        Object.entries,
        // Remove the removed item and its children
        _.filter(([id]) => id !== item.id && !id.startsWith(`${item.id}.`)),
        Object.fromEntries,
      )(tree);
    }

    createTree(tree, this.folder);

    tree = _.pipe(
      Object.entries,
      _.sortBy(([id]) => id),
      Object.fromEntries,
    )(tree);

    createTreeStatus(tree, this.folder, this.originalFolder);

    this.tree = tree;
    this.modifiedContent = true;

    this.clipboardItemId = null;
    this.clipboardItemAction = null;

    const newId = pathToString(newPath);
    if (tree[newId].type === 'item') {
      this.selectedItem = tree[newId];
    }
  }
}
