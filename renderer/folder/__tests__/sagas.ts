import { testSaga, expectSaga } from 'redux-saga-test-plan';
import { push } from 'connected-react-router/immutable';

import * as ipcMessages from '../../../common/ipcMessages';
import { ACTION_TYPES, actions } from '../actions';
import { openFolderAsync, saveFolderAsync, saveFolderCompleteAsync } from '../sagas';
import { getFolderPath } from '../selectors';


describe('folder/sagas', () => {
  beforeAll(() => {
    require('~/lib/electron').sendToIpc = jest.fn();
  });

  it('openFolderAsync', () => {
    const data = [{ language: 'pt-BR', data: {} }];

    return expectSaga(openFolderAsync, { data })
      .put(actions.loadFolder(null))
      .put(push('/folder'))
      .put(actions.loadFolder(data))
      .run();
  });

  it('saveFolderAsync', async () => {
    const payload = [{ language: 'pt-BR', data: {} }];
    const data = { close: true };

    await expectSaga(saveFolderAsync, { data })
      .provide({
        select({ selector }, next) {
          if (selector === getFolderPath) {
            return '/fake/path';
          }

          return next();
        },
      })
      .select(getFolderPath)
      .put(actions.saveRequested(true))
      .take(ACTION_TYPES.SAVE_FOLDER)
      .dispatch(actions.saveFolder(payload))
      .run();

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
