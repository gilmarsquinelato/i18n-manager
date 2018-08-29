import { takeEvery, call, put, take } from 'redux-saga/effects';
import { push } from 'connected-react-router/immutable';
import * as ipcMessages from '../../common/ipcMessages';
import { createIpcChannel, sendToIpc } from '~/lib/electron';

import { ACTION_TYPES, actions } from './actions';


export function* openFolderAsync({ data }: any) {
  yield put(actions.loadFolder(data));
  yield put(push('/folder'));
}

export function* saveFolderAsync({ data }: any) {
  yield put(actions.saveRequested(true));
  const { payload } = yield take(ACTION_TYPES.SAVE_FOLDER);

  sendToIpc(ipcMessages.save, { data, payload });
}

export function* saveFolderCompleteAsync() {
  yield put(actions.saveRequested(false));
}

export default function* folderSagas(): any {
  const openFolderChannel = yield call(createIpcChannel, ipcMessages.open);
  yield takeEvery(openFolderChannel, openFolderAsync);

  const saveFolderChannel = yield call(createIpcChannel, ipcMessages.save);
  yield takeEvery(saveFolderChannel, saveFolderAsync);

  const saveFolderCompleteChannel = yield call(createIpcChannel, ipcMessages.saveComplete);
  yield takeEvery(saveFolderCompleteChannel, saveFolderCompleteAsync);
}
