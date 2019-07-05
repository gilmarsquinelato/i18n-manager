import { call, put, spawn, takeLatest } from 'redux-saga/effects';

import * as ipcMessages from '@common/ipcMessages';
import { navigate } from '@reach/router';
import ipc, { ipcChannel } from '@src/ipcRenderer';
import { IFormattedFolderPath } from '@typings/index';
import { setCurrentVersion, setLatestVersion, setRecentFolders } from './actions';


const RELEASES_URL = 'https://api.github.com/repos/gilmarsquinelato/i18n-manager/releases';

export default function* homeSaga() {
  yield spawn(listenToIpcMessages);
  yield spawn(checkVersion);
}

function* listenToIpcMessages() {
  yield takeLatest(ipcChannel(ipcMessages.recentFolders), updateRecentFoldersSaga);
  yield takeLatest(ipcChannel(ipcMessages.navigateTo), navigateSaga);

  ipc.send(ipcMessages.recentFolders);
}

function* checkVersion() {
  yield put(setCurrentVersion(require('../../../package.json').version));

  try {
    const response = yield call(fetch, RELEASES_URL);
    const releases: any[] = yield response.json();

    const latestRelease = releases[0];

    yield put(setLatestVersion(latestRelease.name));
  } catch (e) {
    //
  }
}

function* updateRecentFoldersSaga(data: IFormattedFolderPath[]) {
  yield put(setRecentFolders(data));
}

function navigateSaga(data: any) {
  if (window.location.pathname === data.path) {
    return;
  }

  navigate(data.path);
}
