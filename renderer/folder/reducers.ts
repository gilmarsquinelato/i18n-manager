import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import { ReducerHandler, ReducerHandlerKey } from '~/lib/types';
import { ACTION_TYPES } from './actions';


const initialState = Immutable.fromJS({
  folder: [],
  isSaveRequested: false,
});

const loadFolder: ReducerHandlerKey = (state, { payload }) => state.merge({
  folder: payload,
});

const saveRequested: ReducerHandlerKey = (state, { payload }) => state.merge({
  isSaveRequested: payload,
});

const reducerMap: ReducerHandler = {
  [ACTION_TYPES.LOAD_FOLDER]: loadFolder,
  [ACTION_TYPES.SAVE_REQUESTED]: saveRequested,
};

export default handleActions(reducerMap, initialState);
