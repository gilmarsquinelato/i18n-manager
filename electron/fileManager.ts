import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { getOrCreateAvailableWindow, sendOpen } from './windowManager';
import { openFile, ParsedFile} from './pluginManager';

export const openFolder = async (folderPath: string) => {
  console.log('OPEN: ', folderPath);

  const files = await getFiles(folderPath);
  const parsedFiles = await getParsedFiles(files);

  console.log(parsedFiles);

  const window = getOrCreateAvailableWindow();
  sendOpen(window, folderPath);
};

const getFiles = async (folderPath: string): Promise<string[]> => {
  let files = await util.promisify(fs.readdir)(folderPath);
  return files
    .filter(f => !f.startsWith('.'))
    .map(f => path.join(folderPath, f))
    .filter(f => fs.lstatSync(f).isFile());
}

const getParsedFiles = async (files: string[]): Promise<ParsedFile[]> => {
  const parsedFiles: ParsedFile[] = [];
  for (let i = 0; i < files.length; ++i) {
    const parsedFile = await openFile(files[i]);
    if (parsedFile) {
      parsedFiles.push(parsedFile);
    }
  }

  return parsedFiles;
}