import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import { ReducerHandler } from '~/lib/types';
import { ACTION_TYPES } from './actions';


const initialState = Immutable.fromJS({
  settings: {},
});


const reducerMap: ReducerHandler = {
  [ACTION_TYPES.SET_SETTINGS]: (state, { payload }) => state.merge({ settings: payload }),
};

export default handleActions(reducerMap, initialState);
