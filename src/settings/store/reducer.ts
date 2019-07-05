import { handleActions } from 'redux-actions';

import { defaultSetReducer } from '@src/store/functions';
import { ACTION_TYPES } from './actions';
import { ISettingsState } from './types';


const initialState: ISettingsState = {
  settings: {
    googleTranslateApiKey: '',
  },
};

export default handleActions({
  [ACTION_TYPES.SET_SETTINGS]: defaultSetReducer<ISettingsState>('settings'),
}, initialState);
