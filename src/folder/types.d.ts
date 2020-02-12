type TreeItemStatus = 'normal' | 'new' | 'changed' | 'missing';
type TreeItemType = 'folder' | 'file' | 'node' | 'item';

export interface ITreeItem {
  id: string;
  parent: string;
  type: TreeItemType;
  path: any[];
  label: string;
  status: TreeItemStatus;
  missingCount: number;
  untranslated: boolean;
}

export interface IChangeFolderValuePayload {
  index: number;
  itemId: string;
  value: string;
}

export interface ILanguageListItem {
  language: string;
  label: string;
}

export interface ITranslatePayload {
  targetLanguages: string[];
  sourceLanguage: string;
  mode: string;
  overwrite: boolean;
}

export interface ITranslationError {
  path: string[];
  error: string;
}

export interface ITranslationProgress {
  total: number;
  current: number;
  path: string[];
  language: string;
  estimatedTimeInMs: number;
}

export interface IContentItem {
  language: string;
  languageIndex: number;
  value: any;
}
