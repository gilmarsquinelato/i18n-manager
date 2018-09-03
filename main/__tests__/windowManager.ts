import _ from 'lodash';
import * as testUtils from './testUtils';
import * as electron from 'electron';

import * as windowManager from '../windowManager';
import * as ipcMessages from '../../common/ipcMessages';


describe('windowManager', () => {
  beforeEach(() => {
    testUtils.mockAll();
  });

  it('hasWindows', () => {
    windowManager.hasWindows();
    expect(electron.BrowserWindow.getAllWindows).toBeCalled();
  });

  it('getOrCreateAvailableWindow', () => {
    const window = windowManager.getOrCreateAvailableWindow();
    expect(window).toBeDefined();
  });

  it('createWindow', () => {
    const window: any = windowManager.createWindow();
    expect(window).toBeDefined();
    expect(window.options.show).toBeFalsy();
    expect(window.loadURL).toBeCalled();

    expect(window.events['resize']).toBeDefined();
    expect(window.events['close']).toBeDefined();
    expect(window.events['ready-to-show']).toBeDefined();
  });

  it('resize Event', () => {
    const window: any = windowManager.createWindow();
    window.trigger('resize');
    expect(window.events['resize'][0]).toBeCalled();
  });

  it('ready-to-show Event', () => {
    const window: any = windowManager.createWindow();
    window.trigger('ready-to-show');
    expect(window.show).toBeCalled();
    expect(window.focus).toBeCalled();
  });

  it('close Event - without modifications', () => {
    const window: any = windowManager.createWindow();
    window.trigger('close');
    expect(window.events['close'][0]).toBeCalled();
  });

  it('close Event - with modifications - YES', async () => {
    const window: any = windowManager.createWindow();
    window.setDocumentEdited(true);

    await window.trigger('close');
    expect(window.events['close'][0]).toBeCalled();
    expect(electron.dialog.showMessageBox).toBeCalled();
    expect((electron as any).webContentsSendFunction)
      .toBeCalledWith(ipcMessages.save, { close: true });
  });

  it('close Event - with modifications - NO', async () => {
    const window: any = windowManager.createWindow();
    (electron as any).setDialogReturns(2);
    window.setDocumentEdited(true);

    await window.trigger('close');
    expect(window.events['close'][0]).toBeCalled();
    expect(window.destroy).toBeCalled();
  });
});
