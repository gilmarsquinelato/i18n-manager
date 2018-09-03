import { all } from 'redux-saga/effects';

import homeSagas from '~/home/sagas';
import settingsSagas from '~/settings/sagas';
import folderSagas from '~/folder/sagas';
import navigationSaga from './navigationSaga';


export default function* rootSaga() {
  yield all([
    navigationSaga(),
    folderSagas(),
    homeSagas(),
    settingsSagas(),
  ]);
}
