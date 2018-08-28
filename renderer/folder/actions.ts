import { createAction } from 'redux-actions';


export const ACTION_TYPES = {
  LOAD_FOLDER: 'i18n/folder/LOAD_FOLDER',
};

export const actions = {
  loadFolder: createAction(ACTION_TYPES.LOAD_FOLDER),
};
