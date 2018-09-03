import { testSaga } from 'redux-saga-test-plan';
import { setRecentFoldersAsync } from '../sagas';
import { actions } from '../actions';


describe('home/sagas', () => {

  it('setRecentFoldersAsync', () => {
    const recent = ['folder1', 'folder2'];
    testSaga(setRecentFoldersAsync, { data: recent })
      .next()

      .put(actions.setRecentFolders(recent))
      .next()

      .isDone();
  });
});
