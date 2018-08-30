import * as path from 'path';
import { ipcMain, BrowserWindow, dialog } from 'electron';

import { ParsedFile, IContextMenuOptions } from '../common/types';
import * as ipcMessages from '../common/ipcMessages';
import * as fileManager from './fileManager';
import * as windowManager from './windowManager';
import { showContextMenu } from './contextMenu';


const onSave = async (e: any, data: any) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  const closeWindow = data.data.close;
  const folder = data.payload;

  const result = await fileManager.saveFolder(folder);

  const folderPath = path.dirname((folder as ParsedFile[])[0].filePath);
  const parsedFolder = await fileManager.parseFolder(folderPath);
  windowManager.sendOpen(window, parsedFolder);

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

const onDataChanged = (e: any, data: boolean) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  window.setDocumentEdited(data);
};

const onShowContextMenu = (e: any, data: IContextMenuOptions) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  showContextMenu(window, data);
};

const registerAppEvents = () => {
  ipcMain.on(ipcMessages.save as any, onSave);
  ipcMain.on(ipcMessages.dataChanged as any, onDataChanged);
  ipcMain.on(ipcMessages.showContextMenu as any, onShowContextMenu);
};

export default registerAppEvents;
