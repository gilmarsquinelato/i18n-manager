import { BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import _ from 'lodash';
import isDev from 'electron-is-dev';

import * as ipcMessages from '../common/ipcMessages';
import { ParsedFile } from '../common/types';
import * as settings from './settings';
import { getFormattedFoldersPaths } from './pathUtils';


export const hasWindows = (): boolean => BrowserWindow.getAllWindows().length > 0;

export const getOrCreateAvailableWindow = (): BrowserWindow => {
  const window = getAvailableWindow();
  return window ? window : createWindow();
};

export const createWindow = (): BrowserWindow => {
  const window = new BrowserWindow({
    ...settings.getSavedSettings().window,
    show: false,
  });

  window.loadURL(getUrl());

  registerEvents(window);
  sendRecentFolders(window, settings.getRecentFolders());

  return window;
};

export const getCurrentWindow = (): BrowserWindow => BrowserWindow.getFocusedWindow();


export const sendOpen = async (window: BrowserWindow, folderPath: string, folder: ParsedFile[]) => {
  sendToIpc(window, ipcMessages.open, { folder, folderPath });
};

export const sendSave = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.save, data);
};

export const sendSaveComplete = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.saveComplete, data);
};

export const sendAddTreeItem = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.addTreeItem, data);
};

export const sendRemoveTreeItem = (window: BrowserWindow, data: any = {}) => {
  sendToIpc(window, ipcMessages.removeTreeItem, data);
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

const sendToIpc = (window: BrowserWindow, message: string, data: any) => {
  const send = () => window.webContents.send(message, data);

  if (window.webContents.isLoading()) {
    window.once('ready-to-show', send);
  } else {
    send();
  }
};

export enum SaveResponse {
  Save,
  Cancel,
  DontSave,
}

export const showSaveDialog = (window: BrowserWindow): Promise<SaveResponse> =>
  new Promise((resolve) => {
    dialog.showMessageBox(
      window,
      {
        type: 'question',
        buttons: ['Save', 'Cancel', 'Don\'t Save'],
        message: 'Do you want to save the changes you made?',
        detail: 'Your changes will be lost if you don\'t save them.',
      },
      (response: number) => {
        switch (response) {
          case 0:
            resolve(SaveResponse.Save);
            break;
          case 1:
            resolve(SaveResponse.Cancel);
            break;
          case 2:
            resolve(SaveResponse.DontSave);
            break;
        }
      });
  });


export const getAvailableWindow = (): BrowserWindow =>
  BrowserWindow.getAllWindows()
    .filter(w => !w.isDocumentEdited())[0];

const getUrl = () => (
  isDev ?
    'http://localhost:1234' :
    `file://${path.join(__dirname, '../view/index.html')}`
);


const registerEvents = (window: BrowserWindow) => {
  window.on('close', onClose(window));
  window.on('resize', _.debounce(onResize(window), 1000));
  window.once('ready-to-show', onReadyToShow(window));
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
    sendSave(window, { close: true });
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
