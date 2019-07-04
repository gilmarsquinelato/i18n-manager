import {
  ILanguageListItem,
  ITranslationError,
  ITranslationProgress,
  ITreeItem,
} from '../types';


export interface IFolderState {
  originalFolder: IloadedPath[];
  folder: IloadedPath[];
  folderPath: string;
  isLoading: boolean;
  isSaving: boolean;
  tree: ITreeItem[];
  selectedId: string;
  selectedItem?: ITreeItem;
  addingItemData?: any;
  renamingItemId?: string;
  languageList: ILanguageListItem[];
  allLanguages: string[];
  supportedLanguages: string[];
  isTranslating: boolean;
  translationProgress: ITranslationProgress;
  translationErrors: ITranslationError[];
}
