import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import { ParsedFile } from '../common/types';
import { getLocaleFromText } from '../common/language';
import getPlugins, { Plugin } from './plugins';


const readFilePromise = util.promisify(fs.readFile);
const writeFilePromise = util.promisify(fs.writeFile);

export const getAvailablePlugins = (): Plugin[] => getPlugins();

export const getParsedFiles = async (files: string[]): Promise<ParsedFile[]> => {
  const parsedFiles: ParsedFile[] = [];
  for (let i = 0; i < files.length; ++i) {
    const parsedFile = await openFile(files[i]);
    if (parsedFile) {
      parsedFiles.push(parsedFile);
    }
  }

  return parsedFiles;
};

export const openFile = async (filePath: string): Promise<ParsedFile> => {
  const fileContent = await readFilePromise(filePath);

  const plugin = getPluginForFile(filePath);
  if (!plugin) {
    return null;
  }

  const fileName = path.basename(filePath);
  const extension = path.extname(filePath);
  const fileNameWithoutExtension = fileName.replace(extension, '');
  const language = getLocaleFromText(fileNameWithoutExtension) || fileNameWithoutExtension;

  if (!language) {
    return null;
  }

  const data = await plugin.parse(fileContent.toString());
  if (!data) {
    return null;
  }

  return {
    fileName,
    language,
    extension,
    filePath,
    data,
  };
};

export const saveFile = async (parsedFile: ParsedFile): Promise<boolean> => {
  try {
    const plugin = getPluginForFile(parsedFile.filePath);
    const serializedContent = await plugin.serialize(parsedFile.data);
    await writeFilePromise(parsedFile.filePath, serializedContent);
    return true;
  } catch (e) {
    return false;
  }
};

const getPluginForFile = (path: string) =>
  getPlugins()
    .filter(plugin => pluginSupportsFileExtension(plugin, path))[0];

const pluginSupportsFileExtension = (plugin: Plugin, path: string) =>
  plugin.fileExtensions
    .filter(extension => path.toLowerCase().endsWith(extension))
    .length > 0;
