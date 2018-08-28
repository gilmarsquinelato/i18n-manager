import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import { ReducerHandler, ReducerHandlerKey } from '~/lib/types';
import { ACTION_TYPES } from './actions';


const initialState = Immutable.fromJS({
  folder: [],
});

const loadFolder: ReducerHandlerKey = (state, { payload }) => state.merge({
  folder: payload,
});

const reducerMap: ReducerHandler = {
  [ACTION_TYPES.LOAD_FOLDER]: loadFolder,
};

export default handleActions(reducerMap, initialState);
