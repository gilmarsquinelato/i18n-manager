import { takeLatest, put } from 'redux-saga/effects';
import { setRecentFoldersChannel, sendToIpc } from '~/lib/electron';
import * as ipcMessages from '../../common/ipcMessages';

import { ACTION_TYPES, actions } from './actions';


export function* setRecentFoldersAsync({ data }: any) {
  yield put(actions.setRecentFolders(data));
}

export function openFolderAsync({ payload }: any) {
  sendToIpc(ipcMessages.open, payload);
}

export default function* homeSagas(): any {
  yield takeLatest(setRecentFoldersChannel, setRecentFoldersAsync);
  yield takeLatest(ACTION_TYPES.OPEN_FOLDER, openFolderAsync);
}
