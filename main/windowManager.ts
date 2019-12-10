import { BrowserWindow, dialog } from 'electron';
import electronIsDev = require('electron-is-dev');
import * as _ from 'lodash';

import * as ipcMessages from '../common/ipcMessages';
import { ILoadedPath } from '../typings';
import { getFormattedFoldersPaths } from './pathUtils';
import * as settings from './Settings';


export const hasWindows = (): boolean => BrowserWindow.getAllWindows().length > 0;

export const getOrCreateAvailableWindow = (): BrowserWindow => {
  const window = getAvailableWindow();
  return window ? window : createWindow();
};

export const createWindow = (): BrowserWindow => {
  const window = new BrowserWindow({
    ...settings.getSavedSettings().window,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    icon: '../icons/icon.png',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (electronIsDev) {
    window.loadURL('http://localhost:3000');
  } else {
    window.loadFile('build/view/index.html');
  }

  registerEvents(window);

  return window;
};

export const getCurrentWindow = (): BrowserWindow | null => BrowserWindow.getFocusedWindow();


export const sendOpen = async (
  window: Electron.BrowserWindow,
  folderPath: string,
  folder: ILoadedPath[],
) => {
  sendToIpc(window, ipcMessages.open, folder);
  sendToIpc(window, ipcMessages.navigateTo, {path: '/folder'});
};

export const sendSave = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.save, data);
};

export const sendSaveComplete = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.saveComplete, data);
};

export const sendRefreshFolder = (window: BrowserWindow, folder: ILoadedPath[]) => {
  sendToIpc(window, ipcMessages.refreshFolder, folder);
};

export const sendAddTreeItem = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.addTreeItem, data);
};

export const sendRemoveTreeItem = (window: BrowserWindow, itemId: string = '') => {
  sendToIpc(window, ipcMessages.removeTreeItem, itemId);
};

export const sendRenameTreeItem = (window: BrowserWindow, itemId: string = '') => {
  sendToIpc(window, ipcMessages.renameTreeItem, itemId);
};

export const sendNavigateTo = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.navigateTo, data);
};

export const sendSettings = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.settings, data);
};

export const sendRecentFolders = (window: BrowserWindow, data: string[]) => {
  sendToIpc(window, ipcMessages.recentFolders, getFormattedFoldersPaths(data));
};

export const sendClose = (window: BrowserWindow) => {
  sendToIpc(window, ipcMessages.closeFolder, {});
};

const sendToIpc = (window: BrowserWindow, message: string, data: any) => {
  const send = () => window.webContents.send(message, data);

  if (window.webContents.isLoading()) {
    window.webContents.on('did-finish-load', send);
  } else {
    send();
  }
};

export enum SaveResponse {
  Save,
  Cancel,
  DontSave,
}

export const showSaveDialog = async (window: BrowserWindow): Promise<SaveResponse> => {
  const result = await dialog.showMessageBox(
    window,
    {
      type: 'question',
      buttons: ['Save', 'Cancel', 'Don\'t Save'],
      message: 'Do you want to save the changes you made?',
      detail: 'Your changes will be lost if you don\'t save them.',
    },
  );

  switch (result.response) {
    case 0:
      return SaveResponse.Save;
    case 1:
      return SaveResponse.Cancel;
    case 2:
      return SaveResponse.DontSave;
  }
};


export const getAvailableWindow = (): BrowserWindow =>
  BrowserWindow.getAllWindows()
    .filter(w => !w.isDocumentEdited())[0];

const registerEvents = (window: BrowserWindow) => {
  window.on('close', onClose(window));
  window.on('resize', _.debounce(onResize(window), 1000));
  window.on('ready-to-show', onReadyToShow(window));
};

const onClose = (window: BrowserWindow) => async (e: Electron.Event) => {
  if (!window.isDocumentEdited()) {
    return;
  }

  if (e) {
    e.preventDefault();
  }

  const response = await showSaveDialog(window);

  if (response === SaveResponse.Save) {
    sendSave(window, {close: true});
  } else if (response === SaveResponse.DontSave) {
    window.destroy();
  }
};

const onReadyToShow = (window: BrowserWindow) => () => {
  window.show();
  window.focus();
};

const onResize = (window: BrowserWindow) => () => {
  const settingsConfig = settings.getSavedSettings();
  const [width, height] = window.getSize();

  settingsConfig.window = {
    ...settingsConfig.window,
    width,
    height,
  };

  settings.saveSettings(settingsConfig);
};
