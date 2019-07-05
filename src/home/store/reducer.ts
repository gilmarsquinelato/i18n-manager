import { handleActions } from 'redux-actions';

import { defaultSetReducer } from '@src/store/functions';
import { ACTION_TYPES } from './actions';
import { IHomeState } from './types';


const initialState: IHomeState = {
  recentFolders: [],
  currentVersion: '',
  latestVersion: '',
};

export default handleActions({
  [ACTION_TYPES.SET_RECENT_FOLDERS]: defaultSetReducer<IHomeState>('recentFolders'),
  [ACTION_TYPES.SET_CURRENT_VERSION]: defaultSetReducer<IHomeState>('currentVersion'),
  [ACTION_TYPES.SET_LATEST_VERSION]: defaultSetReducer<IHomeState>('latestVersion'),
}, initialState);
