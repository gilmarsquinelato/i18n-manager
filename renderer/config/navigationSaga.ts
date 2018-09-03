import { takeLatest, put, select } from 'redux-saga/effects';
import { navigateToChannel } from '~/lib/electron';
import { push } from 'connected-react-router/immutable';

function* navigateToAsync({ data }: any) {
  const path = yield select((state: any) => state.getIn(['router', 'location', 'pathname']));
  if (path !== data.path) {
    yield put(push(data.path));
  }
}

export default function* navigationSaga() {
  yield takeLatest(navigateToChannel, navigateToAsync);
}
