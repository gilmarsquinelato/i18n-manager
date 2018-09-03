import { takeLatest, put, take } from 'redux-saga/effects';
import { push } from 'connected-react-router/immutable';
import * as ipcMessages from '../../common/ipcMessages';
import {
  sendToIpc, openFolderChannel,
  saveFolderChannel, saveFolderCompleteChannel,
  addTreeItemChannel, removeTreeItemChannel,
} from '~/lib/electron';

import { ACTION_TYPES, actions } from './actions';


export function* openFolderAsync({ data }: any) {
  yield put(actions.loadFolder(null));
  yield put(push('/folder'));
  yield put(actions.loadFolder(data));
}

export function* saveFolderAsync({ data }: any) {
  yield put(actions.saveRequested(true));
  const { payload } = yield take(ACTION_TYPES.SAVE_FOLDER);

  sendToIpc(ipcMessages.save, { data, payload });
}

export function* saveFolderCompleteAsync() {
  yield put(actions.saveRequested(false));
}

export function* addTreeItemAsync({ data }: any) {
  yield put(actions.addTreeItemRequested(data));
}

export function* removeTreeItemAsync({ data }: any) {
  yield put(actions.removeTreeItemRequested(data));
}

export function dataChangedAsync({ payload }: any) {
  sendToIpc(ipcMessages.dataChanged, payload);
}

export function showContextMenuAsync({ payload }: any) {
  sendToIpc(ipcMessages.showContextMenu, payload);
}


export default function* folderSagas(): any {
  yield takeLatest(openFolderChannel, openFolderAsync);
  yield takeLatest(saveFolderChannel, saveFolderAsync);
  yield takeLatest(saveFolderCompleteChannel, saveFolderCompleteAsync);
  yield takeLatest(addTreeItemChannel, addTreeItemAsync);
  yield takeLatest(removeTreeItemChannel, removeTreeItemAsync);

  yield takeLatest(ACTION_TYPES.DATA_CHANGED as any, dataChangedAsync);
  yield takeLatest(ACTION_TYPES.SHOW_CONTEXT_MENU as any, showContextMenuAsync);
}
