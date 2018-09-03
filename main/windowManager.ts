import { BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import _ from 'lodash';
import isDev from 'electron-is-dev';

import * as ipcMessages from '../common/ipcMessages';
import { ParsedFile } from '../common/types';
import * as settings from './settings';


export const hasWindows = (): boolean => BrowserWindow.getAllWindows().length > 0;

export const getOrCreateAvailableWindow = (): BrowserWindow => {
  const window = getAvailableWindow();
  return window ? window : createWindow();
};

export const createWindow = (
  folderPath?: string, files?: ParsedFile[]): BrowserWindow => {
  const window = new BrowserWindow({
    ...settings.getSavedSettings().window,
    show: false,
  });

  window.loadURL(getUrl());

  registerEvents(window, folderPath, files);

  return window;
};

export const getCurrentWindow = (): BrowserWindow => BrowserWindow.getFocusedWindow();


export const sendOpen = async (window: BrowserWindow, folderPath: string, folder: ParsedFile[]) => {
  window.webContents.send(ipcMessages.open, { folder, folderPath });
};

export const sendSave = (window: BrowserWindow, data: any = {}) => {
  window.webContents.send(ipcMessages.save, data);
};

export const sendSaveComplete = (window: BrowserWindow, data: any = {}) => {
  window.webContents.send(ipcMessages.saveComplete, data);
};

export const sendAddTreeItem = (window: BrowserWindow, data: any = {}) => {
  window.webContents.send(ipcMessages.addTreeItem, data);
};

export const sendRemoveTreeItem = (window: BrowserWindow, data: any = {}) => {
  window.webContents.send(ipcMessages.removeTreeItem, data);
};

export const sendNavigateTo = (window: BrowserWindow, data: any = {}) => {
  window.webContents.send(ipcMessages.navigateTo, data);
};

export const sendSettings = (window: BrowserWindow, data: any = {}) => {
  window.webContents.send(ipcMessages.settings, data);
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


const registerEvents = (window: BrowserWindow, folderPath?: string, files?: ParsedFile[]) => {
  window.on('close', onClose(window));
  window.on('resize', _.debounce(onResize(window), 1000));
  window.once('ready-to-show', onReadyToShow(window, folderPath, files));
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

const onReadyToShow = (
  window: BrowserWindow, folderPath?: string, files?: ParsedFile[]) => () => {
    window.show();
    window.focus();
    if (files) {
      sendSettings(window, settings.getCustomSettings());
      sendOpen(window, folderPath, files);
    }
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
