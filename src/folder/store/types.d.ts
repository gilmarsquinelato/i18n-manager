import { Action } from 'easy-peasy';
import { IContextMenuOptions, ParsedFile } from '../../../typings';
import { AppThunk } from '../../store/types';

export interface IFolderModel {
  // states
  originalFolder: ParsedFile[];
  folder: ParsedFile[];
  folderPath: string;
  isLoading: boolean;
  tree: any;
  openedPath: string[];
  addingItemData: any;
  renamingItemPath?: string[];
  // actions
  setIsLoading: Action<IFolderModel, boolean>;
  setFolderPath: Action<IFolderModel, string>;
  setOriginalFolder: Action<IFolderModel, ParsedFile[]>;
  setFolder: Action<IFolderModel, ParsedFile[]>;
  createTree: Action<IFolderModel, ParsedFile[]>;
  setTree: Action<IFolderModel, any>;
  updateTreeItemStatus: Action<IFolderModel, string[]>;
  setOpenedPath: Action<IFolderModel, string[]>;
  setAddingItemData: Action<IFolderModel, any>;
  setRenamingItemPath: Action<IFolderModel, string[] | undefined>;
  cancelItemActions: Action<IFolderModel>;
  // effects
  subscribe: AppThunk<IFolderModel, void>;
  loadFolder: AppThunk<IFolderModel, string>;
  openContextMenu: AppThunk<IFolderModel, IContextMenuOptions>;
  setModifiedContent: AppThunk<IFolderModel, void>;
  addItem: AppThunk<IFolderModel, string>;
  renameItem: AppThunk<IFolderModel, any>;
  removeItem: AppThunk<IFolderModel, string[]>;
}
