import { testSaga } from 'redux-saga-test-plan';
import * as ipcMessages from '../../../common/ipcMessages';
import { saveSettingsAsync } from '../sagas';
import { actions } from '../actions';

describe('settings/sagas', () => {
  beforeAll(() => {
    require('~/lib/electron').sendToIpc = jest.fn();
  });

  it('saveSettingsAsync', () => {
    const settings = { key: 'value' };
    testSaga(saveSettingsAsync, { payload: settings })
      .next()

      .put(actions.setSettings(settings))
      .next()

      .isDone();

    const electron = require('~/lib/electron');
    expect(electron.sendToIpc).toBeCalledWith(ipcMessages.settings, settings);
  });
});
