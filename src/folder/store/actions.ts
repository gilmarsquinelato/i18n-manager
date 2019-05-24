import { action } from 'easy-peasy';
import _ from 'lodash';
import { getTreeItemStatus, walkOnTree } from '../functions';
import { IFolderModel } from './types';

export default {
  setIsLoading: action((state, payload) => {
    state.isLoading = payload;
  }),
  setFolderPath: action((state, payload) => {
    state.folderPath = payload;
  }),
  setOriginalFolder: action((state, payload) => {
    state.originalFolder = payload;
  }),
  setFolder: action((state, payload) => {
    state.folder = payload;
  }),
  createTree: action((state, folder) => {
    const folderData = folder.map(it => it.data);
    state.tree = _.merge.apply(null, folderData as any);
  }),
  setTree: action((state, payload) => {
    state.tree = payload;
  }),
  updateTreeItemStatus: action((state, payload) => {
    // Check every node that doesn't have children and create its status
    walkOnTree(state.tree, payload, (path, hasChildren) => {
      if (!hasChildren) {
        _.set(state.tree, path, getTreeItemStatus(state.folder, state.originalFolder, path));
      }
    });
  }),
  setOpenedPath: action((state, payload) => {
    state.openedPath = payload;
  }),
  setAddingItemData: action((state, payload) => {
    state.addingItemData = payload;
  }),
  setRenamingItemPath: action((state, payload) => {
    state.renamingItemPath = payload;
  }),

  cancelItemActions: action(state => {
    state.addingItemData = null;
    state.renamingItemPath = undefined;
  }),
} as Partial<IFolderModel>;
