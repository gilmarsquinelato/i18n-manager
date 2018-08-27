import { all } from 'redux-saga/effects';

import folderSagas from '~/folder/sagas';


export default function* rootSaga() {
  yield all([
    folderSagas(),
  ]);
}
