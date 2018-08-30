import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import { ReducerHandler, ReducerHandlerKey } from '~/lib/types';
import { ACTION_TYPES } from './actions';


const initialState = Immutable.fromJS({
  folder: [],
  isSaveRequested: false,
  isAddingTreeItem: false,
  currentItemPath: [],
  isAddingTreeItemNode: false,
  isRemovingTreeItem: false,
});

const addTreeItemRequested: ReducerHandlerKey = (state, { payload }) => state.merge({
  isAddingTreeItem: true,
  currentItemPath: payload.path,
  isAddingTreeItemNode: payload.isNode,
});

const addTreeItemFinished: ReducerHandlerKey = state => state.merge({
  isAddingTreeItem: false,
  currentItemPath: [],
  isAddingTreeItemNode: false,
});

const removeTreeItemRequested: ReducerHandlerKey = (state, { payload }) => state.merge({
  isRemovingTreeItem: true,
  currentItemPath: payload.path,
});

const removeTreeItemFinished: ReducerHandlerKey = state => state.merge({
  isRemovingTreeItem: false,
  currentItemPath: [],
});

const reducerMap: ReducerHandler = {
  [ACTION_TYPES.LOAD_FOLDER]: (state, { payload }) => state.merge({ folder: payload }),
  [ACTION_TYPES.SAVE_REQUESTED]: (state, { payload }) => state.merge({ isSaveRequested: payload }),
  [ACTION_TYPES.ADD_TREE_ITEM_REQUESTED]: addTreeItemRequested,
  [ACTION_TYPES.ADD_TREE_ITEM_FINISHED]: addTreeItemFinished,
  [ACTION_TYPES.REMOVE_TREE_ITEM_REQUESTED]: removeTreeItemRequested,
  [ACTION_TYPES.REMOVE_TREE_ITEM_FINISHED]: removeTreeItemFinished,
};

export default handleActions(reducerMap, initialState);
