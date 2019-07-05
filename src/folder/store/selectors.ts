import { IStoreState } from '@src/store/types';

export const tree = (state: IStoreState) => state.folder.tree;
export const folder = (state: IStoreState) => state.folder.folder;
export const originalFolder = (state: IStoreState) => state.folder.originalFolder;
export const isLoading = (state: IStoreState) => state.folder.isLoading;
export const isSaving = (state: IStoreState) => state.folder.isSaving;
export const selectedId = (state: IStoreState) => state.folder.selectedId;
export const selectedItem = (state: IStoreState) => state.folder.selectedItem;
export const addingItemData = (state: IStoreState) => state.folder.addingItemData;
export const renamingItemId = (state: IStoreState) => state.folder.renamingItemId;
export const languageList = (state: IStoreState) => state.folder.languageList;
export const allLanguages = (state: IStoreState) => state.folder.allLanguages;
export const supportedLanguages = (state: IStoreState) => state.folder.supportedLanguages;
export const isTranslating = (state: IStoreState) => state.folder.isTranslating;
export const translationProgress = (state: IStoreState) => state.folder.translationProgress;
export const translationErrors = (state: IStoreState) => state.folder.translationErrors;
