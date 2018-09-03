import { testSaga } from 'redux-saga-test-plan';
import { push } from 'connected-react-router/immutable';

import * as ipcMessages from '../../../common/ipcMessages';
import { ACTION_TYPES, actions } from '../actions';
import { openFolderAsync, saveFolderAsync, saveFolderCompleteAsync } from '../sagas';


describe('folder/sagas', () => {
  beforeAll(() => {
    require('~/lib/electron').sendToIpc = jest.fn();
  });

  it('openFolderAsync', () => {
    const data = [{ language: 'pt-BR', data: {} }];
    testSaga(openFolderAsync, { data })
      .next()

      .put(actions.loadFolder(null))
      .next()

      .put(push('/folder'))
      .next()

      .put(actions.loadFolder(data))
      .next()

      .isDone();
  });

  it('saveFolderAsync', () => {
    const payload = [{ language: 'pt-BR', data: {} }];
    const data = { close: true };

    testSaga(saveFolderAsync, { data })
      .next()

      .put(actions.saveRequested(true))
      .next()

      .take(ACTION_TYPES.SAVE_FOLDER)
      .next(actions.saveFolder(payload))

      .isDone();

    const electron = require('~/lib/electron');
    expect(electron.sendToIpc).toBeCalledWith(ipcMessages.save, { data, payload });
  });

  it('saveFolderCompleteAsync', () => {
    testSaga(saveFolderCompleteAsync)
      .next()

      .put(actions.saveRequested(false))
      .next()

      .isDone();
  });
});
