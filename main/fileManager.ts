import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { getOrCreateAvailableWindow, sendOpen } from './windowManager';
import { getParsedFiles, saveFile } from './pluginManager';
import { ParsedFile } from '../common/types';

export const openFolder = async (folderPath: string) => {
  const files = await getFiles(folderPath);
  const parsedFiles = await getParsedFiles(files);

  const window = getOrCreateAvailableWindow();
  sendOpen(window, parsedFiles);
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
