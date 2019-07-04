import { createAction } from 'redux-actions';

import { IFormattedFolderPath } from '@typings/index';


const namespace = 'i18n/home';

export const ACTION_TYPES = {
  SET_RECENT_FOLDERS: `${namespace}/SET_RECENT_FOLDERS`,
  SET_CURRENT_VERSION: `${namespace}/SET_CURRENT_VERSION`,
  SET_LATEST_VERSION: `${namespace}/SET_LATEST_VERSION`,
};

export const setRecentFolders =
  createAction<IFormattedFolderPath[]>(ACTION_TYPES.SET_RECENT_FOLDERS);
export const setCurrentVersion = createAction<string>(ACTION_TYPES.SET_CURRENT_VERSION);
export const setLatestVersion = createAction<string>(ACTION_TYPES.SET_LATEST_VERSION);
