import { all } from 'redux-saga/effects';

import folderSagas from '~/folder/sagas';
import navigationSaga from './navigationSaga';


export default function* rootSaga() {
  yield all([
    navigationSaga(),
    folderSagas(),
  ]);
}
