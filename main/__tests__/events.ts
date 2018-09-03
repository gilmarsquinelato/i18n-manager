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

    const calls = mockElectron.webContentsSendFunction.mock.calls;
    expect(calls).toHaveLength(5);
    expect(calls[0][0]).toBe(ipcMessages.recentFolders);
    expect(calls[1][0]).toBe(ipcMessages.settings);
    expect(calls[2][0]).toBe(ipcMessages.open);
    expect(calls[3][0]).toBe(ipcMessages.recentFolders);
    expect(calls[4][0]).toBe(ipcMessages.saveComplete);

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
