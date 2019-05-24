import { thunk } from 'easy-peasy';
import * as _ from 'lodash';
import { ParsedFile } from '../../../typings';
import * as ipcMessages from '../../ipcMessages';
import { getTreeItemStatus, isContentChanged, isNode } from '../functions';
import { IFolderModel } from './types';

export default {
  subscribe: thunk((actions, payload, {injections, getState}) => {
    const {ipc} = injections;

    ipc.on(ipcMessages.removeTreeItem, (event: any, path: string[]) => {
      actions.removeItem(path);
    });

    ipc.on(ipcMessages.addTreeItem, (event: any, data: any) => {
      actions.setAddingItemData(data);
    });

    ipc.on(ipcMessages.renameTreeItem, (event: any, data: string[]) => {
      actions.setRenamingItemPath(data);
    });
  }),

  loadFolder: thunk((actions, payload, {injections}) => {
    const {ipc} = injections;

    actions.setIsLoading(true);
    actions.setFolderPath(payload);

    ipc.on(ipcMessages.open, (event: any, data: ParsedFile[]) => {
      actions.setOriginalFolder(_.cloneDeep(data));
      actions.setFolder(_.cloneDeep(data));
      actions.createTree(data);
      actions.updateTreeItemStatus([]);
      actions.setIsLoading(false);
    });
    ipc.send(ipcMessages.open, payload);
  }),

  openContextMenu: thunk((actions, payload, {injections}) => {
    injections.ipc.send(ipcMessages.showContextMenu, payload);
  }),

  setModifiedContent: thunk((actions, payload, {injections, getState}) => {
    const {folder, originalFolder} = getState();
    injections.ipc.send(ipcMessages.dataChanged, isContentChanged(folder, originalFolder));
  }),

  removeItem: thunk((actions, path, {getState, injections}) => {
    const {openedPath, folder} = getState();
    const tree = {...getState().tree};

    for (const item of folder) {
      _.unset(item.data, path);
    }

    actions.setFolder(folder);

    _.unset(tree, path);
    actions.setTree(tree);

    if (_.isEqual(openedPath, path)) {
      actions.setOpenedPath([]);
    }

    actions.setModifiedContent();
  }),

  addItem: thunk((actions, payload, {getState}) => {
    const state = getState();
    if (!state.addingItemData) {
      return;
    }

    const item = state.addingItemData.isNode ? 'new' : {};
    const path = state.addingItemData.path.concat(payload);

    // Add item into the tree
    state.tree = _.set(state.tree, path, item);

    // Add empty values on each file
    for (const folderItem of state.folder) {
      _.set(folderItem.data, path, '');
    }

    // Finish action
    actions.setTree(state.tree);
    actions.setFolder(state.folder);
    actions.setAddingItemData(null);

    if (isNode(state.tree, path)) {
      actions.setOpenedPath(path);
    }

    actions.setModifiedContent();
  }),

  renameItem: thunk((actions, payload, {getState}) => {
    const state = getState();
    if (!state.renamingItemPath) {
      return;
    }

    const oldPath = state.renamingItemPath;
    const newPath = state.renamingItemPath.slice(0, -1).concat(payload);

    // Folder path rename
    for (const item of state.folder) {
      _.set(item.data, newPath, _.get(item.data, oldPath));
      _.unset(item.data, oldPath);
    }

    // Tree path rename
    const tree = _.cloneDeep(state.tree);
    _.set(tree, newPath, _.get(tree, oldPath));
    _.unset(tree, oldPath);
    // Update tree path status
    if (isNode(state.folder, newPath)) {
      _.set(tree, newPath, getTreeItemStatus(state.folder, state.originalFolder, newPath));
    }

    // Finish action
    actions.setTree(tree);
    actions.setFolder(state.folder);
    actions.setRenamingItemPath(undefined);

    // Mark new path as opened
    if (isNode(state.folder, newPath)) {
      actions.setOpenedPath(newPath);
    }

    actions.setModifiedContent();
  }),
} as Partial<IFolderModel>;
