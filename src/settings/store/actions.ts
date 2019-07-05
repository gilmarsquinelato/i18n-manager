import { createAction } from 'redux-actions';

import { ICustomSettings } from '@typings/index';


const namespace = 'i18n/settings';

export const ACTION_TYPES = {
  SET_SETTINGS: `${namespace}/SET_SETTINGS`,
  SAVE_SETTINGS: `${namespace}/SAVE_SETTINGS`,
};

export const setSettings = createAction<ICustomSettings>(ACTION_TYPES.SET_SETTINGS);
export const saveSettings = createAction<ICustomSettings>(ACTION_TYPES.SAVE_SETTINGS);
