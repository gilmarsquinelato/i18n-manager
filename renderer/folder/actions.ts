import { createAction } from 'redux-actions';
import { getNamespacedActionTypes } from '~/lib/actionUtils';


const namespace = 'i18n/folder';
const types = [
  'LOAD_FOLDER',
  'SAVE_REQUESTED',
  'SAVE_FOLDER',
  'DATA_CHANGED',
  'SHOW_CONTEXT_MENU',
  'ADD_TREE_ITEM_REQUESTED',
  'ADD_TREE_ITEM_FINISHED',
  'REMOVE_TREE_ITEM_REQUESTED',
  'REMOVE_TREE_ITEM_FINISHED',
];

export const ACTION_TYPES = getNamespacedActionTypes(namespace, types);

export const actions = {
  loadFolder: createAction(ACTION_TYPES.LOAD_FOLDER),
  saveRequested: createAction(ACTION_TYPES.SAVE_REQUESTED),
  saveFolder: createAction(ACTION_TYPES.SAVE_FOLDER),
  dataChanged: createAction(ACTION_TYPES.DATA_CHANGED),
  showContextMenu: createAction(ACTION_TYPES.SHOW_CONTEXT_MENU),
  addTreeItemRequested: createAction(ACTION_TYPES.ADD_TREE_ITEM_REQUESTED),
  addTreeItemFinished: createAction(ACTION_TYPES.ADD_TREE_ITEM_FINISHED),
  removeTreeItemRequested: createAction(ACTION_TYPES.REMOVE_TREE_ITEM_REQUESTED),
  removeTreeItemFinished: createAction(ACTION_TYPES.REMOVE_TREE_ITEM_FINISHED),
};
