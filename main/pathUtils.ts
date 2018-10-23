import * as path from 'path';
import { IFormattedFolderPath } from '../common/types';

export const getFormattedFoldersPaths = (folders: string[]): IFormattedFolderPath[] => {
  return folders.map(folder => ({
    fullPath: folder,
    folder: path.basename(folder),
    path: path.dirname(folder),
  }));
};
