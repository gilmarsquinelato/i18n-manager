import * as path from 'path';
import { FormattedFolderPath } from '../common/types';

export const getFormattedFoldersPaths = (folders: string[]): FormattedFolderPath[] => {
  return folders.map((folder) => ({
    fullPath: folder,
    folder: path.basename(folder),
    path: path.dirname(folder),
  }));
};
