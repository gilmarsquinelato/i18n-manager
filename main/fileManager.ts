import { app, dialog } from 'electron';
import { exists } from 'fs';
import { promisify } from 'util';

import { ILoadedFolder, ILoadedGroup, ILoadedPath, IParsedFile } from '../typings';
import { loadFolder, saveFile } from './pluginManager';
import * as settings from './Settings';
import {
  createWindow,
  getAvailableWindow,
  sendClose,
  sendOpen,
  sendRecentFolders,
} from './windowManager';


const existsAsync = promisify(exists);

export const openFolder = async (folderPath: string) => {
  const window = getAvailableWindow() || createWindow();
  await openFolderInWindow(folderPath, window);
};

export const openFolderInWindow = async (folderPath: string, window: Electron.BrowserWindow) => {
  let recentFolders: string[];

  const isValidPath = await existsAsync(folderPath);
  if (!isValidPath) {
    recentFolders = settings.removeRecentFolder(folderPath);
    sendClose(window);

    dialog.showMessageBox(
      window,
      {
        type: 'error',
        message: `Folder not found in the given path "${folderPath}"`,
      },
    );
  } else {
    const parsedFiles = await loadFolder(folderPath);
    await sendOpen(window, folderPath, parsedFiles);

    app.addRecentDocument(folderPath);
    recentFolders = settings.addRecentFolder(folderPath);
  }

  sendRecentFolders(window, recentFolders);
};

export const saveFolder = async (data: ILoadedPath[]): Promise<string[]> => {
  const parsedFiles = getParsedFiles(data);
  const saveAll = parsedFiles.map(it => saveFile(it));
  const result = await Promise.all(saveAll);

  return result
    .map((success, index) => !success ? parsedFiles[index].fileName : undefined)
    .filter(Boolean);
};

const getParsedFiles = (data: ILoadedPath[]): IParsedFile[] =>
  data
    .map(it => it.type === 'file'
      ? (it as ILoadedGroup).items
      : getParsedFiles((it as ILoadedFolder).items))
    .flat();
