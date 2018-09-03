import { createAction } from 'redux-actions';
import { getNamespacedActionTypes } from '~/lib/actionUtils';


const namespace = 'i18n/settings';
const types: string[] = [
  'SET_SETTINGS',
  'SAVE_SETTINGS',
];

export const ACTION_TYPES = getNamespacedActionTypes(namespace, types);

export const actions = {
  setSettings: createAction(ACTION_TYPES.SET_SETTINGS),
  saveSettings: createAction(ACTION_TYPES.SAVE_SETTINGS),
};
