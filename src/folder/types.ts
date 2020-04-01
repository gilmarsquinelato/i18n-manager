export type TreeItemStatus = 'normal' | 'new' | 'changed' | 'missing';
export type TreeItemType = 'folder' | 'file' | 'node' | 'item';

export type TreeMap = Record<string, TreeItem>;

export interface TreeItem {
  id: string;
  parent: string;
  type: TreeItemType;
  path: any[];
  label: string;
  status: TreeItemStatus;
  missingCount: number;
  duplicatedCount: number;
  level: number;
}

export interface ChangeFolderValuePayload {
  index: number;
  itemId: string;
  value: string;
}

export interface LanguageListItem {
  language: string;
  label: string;
  disabled: boolean;
}

export interface TranslatePayload {
  targetLanguages: string[];
  sourceLanguage: string;
  mode: 'all' | 'this';
  overwrite: boolean;
}

export interface TranslationError {
  path: string[];
  error: string;
}

export interface TranslationProgress {
  total: number;
  current: number;
  path: any[];
  language: string;
  estimatedTimeInMs: number;
}

export interface ContentItem {
  language: string;
  languageIndex: number;
  value: any;
}

export interface AddItemPayload {
  parent: TreeItem;
  label: string;
  isItem: boolean;
}

export interface RenameItemPayload {
  item: TreeItem;
  label: string;
}

export interface PasteItemPayload {
  parent: TreeItem;
  label: string;
}

export interface DeleteItemPayload {
  item: TreeItem;
}

export interface SetClipboardPayload {
  item: TreeItem;
  action: ClipboardItemAction;
}

export enum ClipboardItemAction {
  copy,
  cut,
}
