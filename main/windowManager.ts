import { BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import _ from 'lodash';
import isDev from 'electron-is-dev';

import * as ipcMessages from '../common/ipcMessages';
import * as Settings from './settings';
import { ParsedFile } from './pluginManager';


export const hasWindows = (): boolean => BrowserWindow.getAllWindows().length > 0;

export const getOrCreateAvailableWindow = (): BrowserWindow => {
  const window = getAvailableWindow();
  return window ? window : createWindow();
};

export const createWindow = (): BrowserWindow => {
  const window = new BrowserWindow({
    ...Settings.getSavedSettings().window,
    show: false,
  });

  window.loadURL(getUrl());

  if (isDev) {
    window.webContents.openDevTools();
  }

  registerEvents(window);

  return window;
};

export const sendOpen = (window: Electron.BrowserWindow, files: ParsedFile[]) => {
  window.webContents.send(ipcMessages.open, files);
};

export enum SaveResponse {
  Save,
  Cancel,
  DontSave,
}

export const showSaveDialog = (window: Electron.BrowserWindow): Promise<SaveResponse> =>
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


const getAvailableWindow = (): BrowserWindow =>
  BrowserWindow.getAllWindows()
    .filter(w => !w.isDocumentEdited())[0];

const getUrl = () => (
  isDev ?
    'http://localhost:1234' :
    `file://${path.join(__dirname, '../view/index.html')}`
);


const registerEvents = (window: Electron.BrowserWindow) => {
  window.on('close', onClose(window));
  window.on('resize', _.debounce(onResize(window), 1000));
  window.once('ready-to-show', onReadyToShow(window));
};

const onClose = (window: Electron.BrowserWindow) => async (e: Electron.Event) => {
  if (!window.isDocumentEdited()) {
    return;
  }

  if (e) {
    e.preventDefault();
  }

  const response = await showSaveDialog(window);

  if (response === SaveResponse.Save) {
    window.webContents.send(ipcMessages.save, { close: true });
  } else if (response === SaveResponse.DontSave) {
    window.destroy();
  }
};

const onReadyToShow = (window: Electron.BrowserWindow) => () => {
  window.show();
  window.focus();
};

const onResize = (window: Electron.BrowserWindow) => () => {
  const settings = Settings.getSavedSettings();
  const [width, height] = window.getSize();

  settings.window = {
    ...settings.window,
    width,
    height,
  };

  Settings.saveSettings(settings);
};
