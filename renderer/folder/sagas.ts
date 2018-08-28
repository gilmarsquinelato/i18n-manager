import { takeEvery, call, put } from 'redux-saga/effects';
import { push } from 'connected-react-router/immutable';
import * as ipcMessages from '../../common/ipcMessages';
import { createIpcChannel } from '~/lib/electron';
import { actions } from './actions';


function* openFolderAsync({ data }: any) {
  yield put(actions.loadFolder(data));
  yield put(push('/folder'));
}

export default function* folderSagas(): any {
  const openFolderChannel = yield call(createIpcChannel, ipcMessages.open);
  yield takeEvery(openFolderChannel, openFolderAsync);
}
