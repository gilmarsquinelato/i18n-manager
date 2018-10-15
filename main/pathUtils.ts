import * as path from 'path';

export interface IFormattedFolderPath {
  fullPath: string;
  folder: string;
  path: string;
}

export const getFormattedFoldersPaths = (folders: string[]): IFormattedFolderPath[] => {
  return folders.map(folder => ({
    fullPath: folder,
    folder: path.basename(folder),
    path: path.dirname(folder),
  }));
};
