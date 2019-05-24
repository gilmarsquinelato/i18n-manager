import { IFolderModel } from './types';

export default {
  originalFolder: [],
  folder: [],
  folderPath: '',
  isLoading: false,
  tree: {},
  openedPath: [],
  addingItemData: null,
  renamingItemPath: undefined,
} as Partial<IFolderModel>;
