import { takeLatest, put } from 'redux-saga/effects';
import * as ipcMessages from '../../common/ipcMessages';
import { settingsChannel, sendToIpc } from '~/lib/electron';

import { ACTION_TYPES, actions } from './actions';


function* settingsAsync({ data }: any) {
  yield put(actions.setSettings(data));
}

export function* saveSettingsAsync({ payload }: any) {
  sendToIpc(ipcMessages.settings, payload);
  yield put(actions.setSettings(payload));
}

export default function* folderSagas(): any {
  yield takeLatest(settingsChannel, settingsAsync);
  yield takeLatest(ACTION_TYPES.SAVE_SETTINGS, saveSettingsAsync);
}
