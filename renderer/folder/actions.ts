import { createAction } from 'redux-actions';


export const ACTION_TYPES = {
  LOAD_FOLDER: 'i18n/folder/LOAD_FOLDER',
  SAVE_REQUESTED: 'i18n/folder/SAVE_REQUESTED',
  SAVE_FOLDER: 'i18n/folder/SAVE_FOLDER',
};

export const actions = {
  loadFolder: createAction(ACTION_TYPES.LOAD_FOLDER),
  saveRequested: createAction(ACTION_TYPES.SAVE_REQUESTED),
  saveFolder: createAction(ACTION_TYPES.SAVE_FOLDER),
};
