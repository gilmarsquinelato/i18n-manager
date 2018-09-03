import { createAction } from 'redux-actions';
import { getNamespacedActionTypes } from '~/lib/actionUtils';


const namespace = 'i18n/home';
const types: string[] = [
  'SET_RECENT_FOLDERS',
  'OPEN_FOLDER',
];

export const ACTION_TYPES = getNamespacedActionTypes(namespace, types);

export const actions = {
  setRecentFolders: createAction(ACTION_TYPES.SET_RECENT_FOLDERS),
  openFolder: createAction(ACTION_TYPES.OPEN_FOLDER),
};
