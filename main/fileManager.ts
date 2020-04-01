import { app, dialog } from 'electron';
import { exists } from 'fs';
import { promisify } from 'util';
import nodeWatch from 'node-watch';
import * as _ from 'lodash/fp';

import { LoadedFolder, LoadedGroup, LoadedPath, ParsedFile } from '../common/types';
import { loadFolder, saveFile } from './pluginManager';
import * as settings from './Settings';
import {
  createWindow,
  getAvailableWindow,
  sendClose,
  sendOpen,
  sendRecentFolders,
  sendRefreshFolder,
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

    dialog.showMessageBox(window, {
      type: 'error',
      message: `Folder not found in the given path "${folderPath}"`,
    });
  } else {
    const parsedFiles = await loadFolder(folderPath);
    await sendOpen(window, folderPath, parsedFiles);
    watchFolder(window, folderPath);

    app.addRecentDocument(folderPath);
    recentFolders = settings.addRecentFolder(folderPath);
  }

  sendRecentFolders(window, recentFolders);
};

export const saveFolder = async (data: LoadedPath[]): Promise<string[]> => {
  const parsedFiles = getParsedFiles(data);
  const saveAll = parsedFiles.map((it) => saveFile(it));
  const result = await Promise.all(saveAll);

  return (
    result
      .map((success, index) => (!success ? parsedFiles[index].fileName : undefined))
      // it's important to filter after due to index
      .filter(Boolean) as string[]
  );
};

const getParsedFiles = (data: LoadedPath[]): ParsedFile[] =>
  data
    .map((it) =>
      it.type === 'file' ? (it as LoadedGroup).items : getParsedFiles((it as LoadedFolder).items),
    )
    .flat();

const watchFolder = (window: Electron.BrowserWindow, folderPath: string) => {
  const handleFileUpdate = _.debounce(1000, async () => {
    const parsedFiles = await loadFolder(folderPath);
    sendRefreshFolder(window, parsedFiles);
  });

  nodeWatch(folderPath, { recursive: true }, handleFileUpdate);
};
