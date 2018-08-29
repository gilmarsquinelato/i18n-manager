import { ipcMain, BrowserWindow, dialog } from 'electron';

import * as ipcMessages from '../common/ipcMessages';
import * as fileManager from './fileManager';
import * as windowManager from './windowManager';


const onSave = async (e: any, data: any) => {
  const window = BrowserWindow.fromWebContents(e.sender);
  const closeWindow = data.data.close;
  const folder = data.payload;

  const result = await fileManager.saveFolder(folder);
  windowManager.sendSaveComplete(window, result);

  if (result.length > 0) {
    dialog.showErrorBox('Failed to save the following files', result.join('\n'));
    return;
  }

  if (closeWindow) {
    window.close();
  }
};

const registerAppEvents = () => {
  ipcMain.on(ipcMessages.save as any, onSave);
};

export default registerAppEvents;
