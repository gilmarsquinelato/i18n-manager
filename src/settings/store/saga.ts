import { Action } from 'redux-actions';
import { put, spawn, takeLatest } from 'redux-saga/effects';

import * as ipcMessages from '@common/ipcMessages';
import { actions as folderActions } from '@src/folder/store';
import ipc, { ipcChannel } from '@src/ipcRenderer';
import { ICustomSettings } from '@typings/index';
import * as actions from './actions';


export default function* homeSaga() {
  yield spawn(listenToIpcMessages);
  yield takeLatest(actions.ACTION_TYPES.SAVE_SETTINGS, saveSettings);
}

function* listenToIpcMessages() {
  yield takeLatest(ipcChannel(ipcMessages.settings), receiveSettings);

  ipc.send(ipcMessages.settings);
}

function* receiveSettings(settings: ICustomSettings) {
  yield put(actions.setSettings(settings));
  yield put(folderActions.loadSupportedLanguages());
}

function* saveSettings(action: Action<ICustomSettings>) {
  yield put(actions.setSettings(action.payload));
  ipc.send(ipcMessages.saveSettings, action.payload);
}
