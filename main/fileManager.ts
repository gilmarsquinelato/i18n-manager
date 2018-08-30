import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { getAvailableWindow, sendOpen, createWindow } from './windowManager';
import { getParsedFiles, saveFile } from './pluginManager';
import { ParsedFile } from '../common/types';


export const openFolder = async (folderPath: string) => {
  const parsedFiles = await parseFolder(folderPath);

  const window = getAvailableWindow();
  if (window) {
    sendOpen(window, parsedFiles);
  } else {
    createWindow(parsedFiles);
  }
};

export const parseFolder =  async (folderPath: string): Promise<ParsedFile[]> => {
  const files = await getFiles(folderPath);
  return await getParsedFiles(files);
};

export const getFiles = async (folderPath: string): Promise<string[]> => {
  const files = await util.promisify(fs.readdir)(folderPath);
  return files
    .filter(f => !f.startsWith('.'))
    .map(f => path.join(folderPath, f))
    .filter(f => fs.lstatSync(f).isFile());
};

export const saveFolder = async (data: ParsedFile[]) => {
  const saveAll = data.map(item => saveFile(item));
  const result = await Promise.all(saveAll);

  const failedToSaveFiles = result
    .map((success: boolean, index: number) => ({ success, file: data[index].fileName }))
    .filter((i: any) => !i.success)
    .map((i: any) => i.file);

  return failedToSaveFiles;
};
