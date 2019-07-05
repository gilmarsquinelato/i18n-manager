import { app } from 'electron';
import { ILoadedFolder, ILoadedGroup, ILoadedPath, IParsedFile } from '../typings';
import { loadFolder, saveFile } from './pluginManager';
import * as settings from './Settings';
import { createWindow, getAvailableWindow, sendOpen, sendRecentFolders } from './windowManager';


export const openFolder = async (folderPath: string) => {
  const window = getAvailableWindow() || createWindow();
  await openFolderInWindow(folderPath, window);
};

export const openFolderInWindow = async (folderPath: string, window: Electron.BrowserWindow) => {
  app.addRecentDocument(folderPath);
  const recent = settings.addRecentFolder(folderPath);
  const parsedFiles = await parseFolder(folderPath);

  await sendOpen(window, folderPath, parsedFiles);
  sendRecentFolders(window, recent);
};

export const parseFolder = async (folderPath: string): Promise<ILoadedPath[]> => {
  return await loadFolder(folderPath);
};

export const saveFolder = async (data: ILoadedPath[]) => {
  const parsedFiles = getParsedFiles(data);
  const saveAll = parsedFiles.map(it => saveFile(it));
  const result = await Promise.all(saveAll);

  return result
    .map((success: boolean, index: number) => ({success, file: parsedFiles[index].fileName}))
    .filter((i: any) => !i.success)
    .map((i: any) => i.file);
};

const getParsedFiles = (data: ILoadedPath[]): IParsedFile[] =>
  data
    .map(it => it.type === 'file'
      ? (it as ILoadedGroup).items
      : getParsedFiles((it as ILoadedFolder).items))
    .flat();
