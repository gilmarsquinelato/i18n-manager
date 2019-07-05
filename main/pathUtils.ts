import * as path from 'path';
import { IFormattedFolderPath } from '../typings';

export const getFormattedFoldersPaths = (folders: string[]): IFormattedFolderPath[] => {
  return folders.map(folder => ({
    fullPath: folder,
    folder: path.basename(folder),
    path: path.dirname(folder),
  }));
};
