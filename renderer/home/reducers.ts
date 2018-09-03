import Immutable from 'immutable';
import { handleActions } from 'redux-actions';

import { ReducerHandler } from '~/lib/types';
import { ACTION_TYPES } from './actions';


const initialState = Immutable.fromJS({
  recent: [],
});


const reducerMap: ReducerHandler = {
  [ACTION_TYPES.SET_RECENT_FOLDERS]: (state, { payload }) => state.merge({ recent: payload }),
};

export default handleActions(reducerMap, initialState);
