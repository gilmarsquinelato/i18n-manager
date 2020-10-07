import { app, dialog } from 'electron';
import { exists } from 'fs';
import { promisify } from 'util';
import nodeWatch from 'node-watch';
import * as _ from 'lodash/fp';
import * as xlsx from 'xlsx';

import { LoadedFolder, LoadedGroup, LoadedPath, ParsedFile } from '../common/types';
import { loadFolder, saveFile, parseXlsx } from './pluginManager';
import * as settings from './Settings';
import {
  createWindow,
  getAvailableWindow, getCurrentWindow,
  sendClose,
  sendOpen,
  sendSave,
  sendRecentFolders,
  sendRefreshFolder
} from './windowManager'

const existsAsync = promisify(exists);
let watcher: any;

export const openFolder = async (folderPath: string) => {
  const window = getAvailableWindow() || createWindow();
  await openFolderInWindow(folderPath, window);
};

export const openFile = async (filePath: string) => {
  const window = getAvailableWindow() || createWindow();
  const isValidPath = await existsAsync(filePath);
  if (!isValidPath) {
    dialog.showMessageBox(window, {
      type: 'error',
      message: `File not found in the given path "${filePath}"`,
    });
  } else {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select save directory',
      properties: ['openDirectory'],
    });
    if (canceled) { return; }
    const savePath = filePaths[0];
    const parsedData = await parseXlsx(filePath, savePath);
    if (parsedData.length) {
      await sendOpen(window, savePath, parsedData);
      sendSave(window);
      watchFolder(window, savePath);

      app.addRecentDocument(savePath);
      const recentFolders = settings.addRecentFolder(savePath);
      sendRecentFolders(window, recentFolders);
    } else {
      dialog.showMessageBox(window, {
        type: 'error',
        message: `Data not found in the given file "${filePath}"`,
      });
    }
  }
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

export const saveXls = async (data: any, window: Electron.BrowserWindow) => {
  if (!window) {
    return false
  }
  const file = await dialog.showSaveDialog(window, {
    filters: [
      { name: 'Microsoft Excel (xlsx)', extensions: ['xlsx', 'xls'] },
      { name: 'Comma-separated values (csv)', extensions: ['csv'] },
    ],
  });
  if (file.canceled) {
    return false;
  }
  const { selectedLanguages, sheetData } = data;
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet([['filename', 'label', ...selectedLanguages]]);
  for (const fileName in sheetData) {
    for (const label in sheetData[fileName]) {
      let row = [fileName, label];
      selectedLanguages.map((lang: string) => {
        const val = sheetData[fileName][label][lang] || '';
        row.push(val);
      });
      xlsx.utils.sheet_add_aoa(ws, [
        [...row]
      ], {
        origin: -1,
      });
    }
  }
  const filePath = file.filePath || ''
  xlsx.utils.book_append_sheet(wb, ws);
  try {
    await xlsx.writeFile(wb, filePath);
    return true;
  } catch (e) {
    throw e;
  }
};

const getParsedFiles = (data: LoadedPath[]): ParsedFile[] =>
  data
    .map((it) =>
      it.type === 'file' ? (it as LoadedGroup).items : getParsedFiles((it as LoadedFolder).items),
    )
    .flat();

export const closeFolderWatcher = function () {
  if (typeof watcher !== undefined) {
    if (watcher && typeof watcher.close !== undefined) {
      watcher.close();
    }
  }
}

const watchFolder = (window: Electron.BrowserWindow, folderPath: string) => {
  const handleFileUpdate = _.debounce(1000, async () => {
    const parsedFiles = await loadFolder(folderPath);
    sendRefreshFolder(window, parsedFiles);
  });

  closeFolderWatcher();
  watcher = nodeWatch(folderPath, { recursive: true }, handleFileUpdate);
};
