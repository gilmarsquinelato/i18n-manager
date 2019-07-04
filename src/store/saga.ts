import { all } from 'redux-saga/effects';

import { saga as folderSaga } from '@src/folder/store';
import { saga as homeSaga } from '@src/home/store';
import { saga as settingsSaga } from '@src/settings/store';


export default function* rootSaga() {
  yield all([
    homeSaga(),
    folderSaga(),
    settingsSaga(),
  ]);
}
