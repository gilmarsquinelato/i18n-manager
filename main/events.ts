import * as path from 'path';
import { app, ipcMain, BrowserWindow, dialog } from 'electron';

import { ParsedFile, IContextMenuOptions } from '../common/types';
import * as ipcMessages from '../common/ipcMessages';
import * as fileManager from './fileManager';
import * as windowManager from './windowManager';
import { showContextMenu } from './contextMenu';
import * as settings from './settings';


const onSave = async (e: any, data: any) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  const closeWindow = data.data.close;
  const folder = data.payload;

  const result = await fileManager.saveFolder(folder);

  const folderPath = path.dirname((folder as ParsedFile[])[0].filePath);
  await fileManager.openFolderInWindow(folderPath, window);

  window.setDocumentEdited(false);
  windowManager.sendSaveComplete(window, result);

  if (result.length > 0) {
    dialog.showErrorBox('Failed to save the following files', result.join('\n'));
    return;
  }

  if (closeWindow) {
    window.close();
  }
};

const onOpen = (e: any, data: string) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  fileManager.openFolderInWindow(data, window);
};

const onDataChanged = (e: any, data: boolean) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  window.setDocumentEdited(data);
};

const onShowContextMenu = (e: any, data: IContextMenuOptions) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  showContextMenu(window, data);
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

const registerAppEvents = () => {
  ipcMain.on(ipcMessages.open as any, onOpen);
  ipcMain.on(ipcMessages.save as any, onSave);
  ipcMain.on(ipcMessages.dataChanged as any, onDataChanged);
  ipcMain.on(ipcMessages.showContextMenu as any, onShowContextMenu);
  ipcMain.on(ipcMessages.settings as any, onSaveSettings);
  app.on('open-file', onOpenFile);
  app.on('will-finish-launching', () => {
    app.on('open-file', onOpenFile);
  });
};

export default registerAppEvents;
