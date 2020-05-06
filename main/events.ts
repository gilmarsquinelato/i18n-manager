import { app, BrowserWindow, dialog, ipcMain } from 'electron';

import * as ipcMessages from '../common/ipcMessages';
import { ParsedFile } from '../common/types';
import * as fileManager from './fileManager';
import * as settings from './Settings';
import * as windowManager from './windowManager';

const onSave = async (e: any, data: any) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  if (!window) return;

  const closeWindow = data.data.close;
  const closeDirectory = data.data.closeDirectory;
  const folder = data.payload;

  if ((folder as ParsedFile[]).length === 0) {
    windowManager.sendSaveComplete(window, []);
    return;
  }

  const result = await fileManager.saveFolder(folder);

  if (result.length > 0) {
    dialog.showErrorBox('Failed to save the following files', result.join('\n'));
    return;
  }

  windowManager.sendSaveComplete(window, result);
  window.setDocumentEdited(false);

  if (closeWindow) {
    window.close();
  }

  if (closeDirectory) {
    windowManager.sendClose(window);
  }
};

const onOpen = (e: any, data: string) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  if (!window) return;
  fileManager.openFolderInWindow(data, window);
};

const onDataChanged = (e: any, data: boolean) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  if (!window) return;
  window.setDocumentEdited(data);
};

const onGetSettings = (e: any) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  if (!window) return;
  windowManager.sendSettings(window, settings.getCustomSettings());
};

const onSaveSettings = (e: any, data: any) => {
  settings.saveCustomSettings(data);
};

const onOpenFile = (e: any, data: any) => {
  if (app.isReady()) {
    fileManager.openFolder(data);
  } else {
    app.on('ready', () => fileManager.openFolder(data));
  }
};

const onRecentFolders = (e: any) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  if (!window) return;
  windowManager.sendRecentFolders(window, settings.getRecentFolders());
};

const registerAppEvents = () => {
  ipcMain.on(ipcMessages.open, onOpen);
  ipcMain.on(ipcMessages.save, onSave);
  ipcMain.on(ipcMessages.dataChanged, onDataChanged);
  ipcMain.on(ipcMessages.saveSettings, onSaveSettings);
  ipcMain.on(ipcMessages.settings, onGetSettings);
  ipcMain.on(ipcMessages.recentFolders, onRecentFolders);

  app.on('open-file', onOpenFile);
  app.on('will-finish-launching', () => {
    app.on('open-file', onOpenFile);
  });
};

export default registerAppEvents;
