import _ from 'lodash';
import * as testUtils from './testUtils';
import * as electron from 'electron';

import registerAppEvents from '../events';
import * as windowManager from '../windowManager';
import * as fileManager from '../fileManager';
import * as ipcMessages from '../../common/ipcMessages';


describe('events', () => {
  beforeEach(() => {
    testUtils.mockAll();

    registerAppEvents();
  });

  it('onSave', async () => {
    const window: any = windowManager.createWindow();
    const folder = await fileManager.parseFolder(testUtils.basePath);

    const event: any = {
      sender: window,
    };

    const data: any = {
      payload: folder,
      data: {},
    };

    const mockElectron = electron as any;

    await mockElectron.ipcMain.trigger(ipcMessages.save, event, data);

    const [[call1], [call2]] = mockElectron.webContentsSendFunction.mock.calls;
    expect(call1).toBe(ipcMessages.open);
    expect(call2).toBe(ipcMessages.saveComplete);

    expect(window.isDocumentEdited()).toBeFalsy();
  });

  it('onDataChanged - true', async () => {
    const window: any = windowManager.createWindow();

    const event: any = {
      sender: window,
    };

    const mockElectron = electron as any;

    await mockElectron.ipcMain.trigger(ipcMessages.dataChanged, event, true);
    expect(window.isDocumentEdited()).toBeTruthy();
  });

  it('onDataChanged - false', async () => {
    const window: any = windowManager.createWindow();

    const event: any = {
      sender: window,
    };

    const mockElectron = electron as any;

    await mockElectron.ipcMain.trigger(ipcMessages.dataChanged, event, false);
    expect(window.isDocumentEdited()).toBeFalsy();
  });
});
