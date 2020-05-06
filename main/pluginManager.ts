import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import * as util from 'util';

import { getLocale } from '../common/language';
import { LoadedFolder, LoadedGroup, LoadedPath, ParsedFile } from '../common/types';
import getPlugins, { IPlugin } from './plugins';

const readdirAsync = util.promisify(fs.readdir);
const readFileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
const statAsync = util.promisify(fs.stat);

const DEFAULT_GROUP_NAME = 'Unknown Prefix';

export const getAvailablePlugins = (): IPlugin[] => getPlugins();

export const loadFolder = async (folderPath: string): Promise<LoadedPath[]> => {
  const folderContent = await readdirAsync(folderPath);
  const stats = await getFolderStats(folderPath, folderContent);

  const groupedFiles = await getGroupedFiles(folderPath, folderContent, stats);
  const groupedLanguageFolders = await getGroupedLanguageFolders(folderPath, folderContent, stats);
  const subFolders = await getSubFolders(folderPath, folderContent, stats);

  return groupedFiles.concat(groupedLanguageFolders).concat(subFolders);
};

export const parseFile = async (filePath: string): Promise<any> => {
  try {
    const fileContent = await readFileAsync(filePath);

    const plugin = getPluginForFile(filePath);
    if (!plugin) {
      return {};
    }

    const data = await plugin.parse(fileContent.toString());
    return data ?? {};
  } catch (e) {
    return undefined;
  }
};

export const saveFile = async (parsedFile: ParsedFile): Promise<boolean> => {
  try {
    const plugin = getPluginForFile(parsedFile.filePath);
    // it's better to merge the content instead of overwriting it due to
    //   1 - handwritten items won't be lost
    //   2 - we keep the file structure the same, then not reordering the file structure (fixes #211)
    const fileContent = await readFileAsync(parsedFile.filePath);
    const data = await plugin.parse(fileContent.toString());
    const updatedData = mergeDrop(data, parsedFile.data);


    const serializedContent = await plugin.serialize(updatedData);
    if (serializedContent === null) {
      return false;
    }

    await writeFileAsync(parsedFile.filePath, serializedContent);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

/**
 * This is a custom merge function
 * It keeps the original object structure and drops in the first object what isn't preset in the second one
 *
 * @param obj1
 * @param obj2
 */
const mergeDrop = (obj1: any, obj2: any) => {
  // if one of them is not an object we don't need to proceed with the mergind process
  if (!obj1 || !obj2) return obj2;

  // Drop the non existing properties recursively
  const obj1Keys = Object.keys(obj1);
  for (let i = 0; i < obj1Keys.length; i++) {
    const key = obj1Keys[i];

    if (obj2[key] === undefined) {
      Reflect.deleteProperty(obj1, key);
    } else if (typeof obj2[key] === 'object') {
      Reflect.set(obj1, key, mergeDrop(obj1[key], obj2[key]));
    }
  }

  // Set the new values
  const obj2Keys = Object.keys(obj2);
  for (let i = 0; i < obj2Keys.length; i++) {
    const key = obj2Keys[i];

    if (typeof obj2[key] === 'string') {
      Reflect.set(obj1, key, obj2[key]);
    } else if (typeof obj2[key] === 'object') {
      Reflect.set(obj1, key, mergeDrop(obj1[key], obj2[key]));
    }
  }

  return obj1;
};

const getPluginForFile = (filePath: string) =>
  getPlugins().filter((plugin) => pluginSupportsFileExtension(plugin, filePath))[0];

const pluginSupportsFileExtension = (plugin: IPlugin, filePath: string) =>
  plugin.fileExtensions.filter((extension) => filePath.toLowerCase().endsWith(extension)).length >
  0;

type LoadItemsFn = (
  folderPath: string,
  folderContent: string[],
  stats: Record<string, fs.Stats>,
) => Promise<LoadedPath[]>;

const getGroupedFiles: LoadItemsFn = async (folderPath, folderContent, stats) => {
  const files = folderContent
    .filter((it) => !stats[it].isDirectory())
    .map((it) => getFileDetails(it, path.join(folderPath, it)))
    .filter(Boolean) as IFileDetails[];

  return parseFilesWithGroup(folderPath, files);
};

const getGroupedLanguageFolders: LoadItemsFn = async (folderPath, folderContent, stats) => {
  const languageFolders = folderContent.filter((it) => stats[it].isDirectory() && getLocale(it));

  const foldersFiles: Record<string, string[]> = (
    await Promise.all(
      languageFolders.map(async (folder) => {
        const languageFolderPath = path.join(folderPath, folder);
        const folderItems = await readdirAsync(languageFolderPath);
        const folderStats = await getFolderStats(languageFolderPath, folderItems);
        return {
          [folder]: folderItems.filter((it) => !folderStats[it].isDirectory()),
        };
      }),
    )
  ).reduce((acc, curr) => ({ ...acc, ...curr }), {});

  const files: IFileDetails[] = _.flatMap(
    Object.entries(foldersFiles).map(([folder, folderFiles]) =>
      folderFiles.map((file) => {
        const fileName = getFileNameWithoutExtension(file);
        return {
          fileName: file,
          filePath: path.join(folderPath, folder, file),
          language: folder,
          prefix: fileName,
        } as IFileDetails;
      }),
    ),
  );

  return parseFilesWithGroup(folderPath, files);
};

const getSubFolders: LoadItemsFn = async (folderPath, folderContent, stats) => {
  const folders = folderContent.filter((it) => stats[it].isDirectory() && !getLocale(it));

  return Promise.all(
    folders.map(async (it) => {
      const items = await loadFolder(path.join(folderPath, it));
      return {
        items,
        type: 'folder',
        name: it,
      } as LoadedFolder;
    }),
  );
};

const parseFilesWithGroup = async (
  folderPath: string,
  files: IFileDetails[],
): Promise<LoadedGroup[]> => {
  const groupedByPrefix = _.groupBy(files, (it) => it.prefix);

  const entries = Object.entries(groupedByPrefix);

  return _.flatMap(
    await Promise.all(
      entries.map(async ([prefix, items]) => {
        const groupFiles = (await parseFilesFromDetails(items)).filter(Boolean);

        return {
          type: 'file',
          name: prefix,
          items: groupFiles,
        } as LoadedGroup;
      }),
    ),
  ).filter((it) => it.items.length > 0);
};

const parseFilesFromDetails = async (items: IFileDetails[]) =>
  await Promise.all(items.map(parseFileFromDetails));

const parseFileFromDetails = async (details: IFileDetails): Promise<ParsedFile | undefined> => {
  const plugin = getPluginForFile(details.fileName);
  if (!plugin) {
    return undefined;
  }

  const fileContent = await parseFile(details.filePath);

  return {
    ...details,
    extension: path.extname(details.fileName),
    data: fileContent,
  };
};

const getFolderStats = async (
  folderPath: string,
  folderContent: string[],
): Promise<Record<string, fs.Stats>> => {
  const stats: Record<string, fs.Stats> = {};
  for (const item of folderContent) {
    stats[item] = await statAsync(path.join(folderPath, item));
  }

  return stats;
};

const getFileNameWithoutExtension = (fileName: string) =>
  fileName.split('.').slice(0, -1).join('.');

const separators = /[._]/g;
const getFileDetails = (fileName: string, filePath: string): IFileDetails | undefined => {
  const nameWithoutExtension = getFileNameWithoutExtension(fileName);

  // Split to get locales and files groups, will only split by "." or "_"
  const normalizedName = nameWithoutExtension.replace(separators, '||').split('||');

  const locale = getLocale(nameWithoutExtension); // the entire fileName is it's locale
  if (locale) {
    return {
      fileName,
      filePath,
      language: locale,
      prefix: DEFAULT_GROUP_NAME,
    };
  }

  let prefix = normalizedName[0];
  let language: string | undefined;

  // search for the better language name
  // when found set the previous as prefix
  for (let i = 1; i < normalizedName.length; i++) {
    const lang = getLocale(normalizedName.slice(i).join('-'));
    if (lang) {
      // -1 because the separator
      prefix = nameWithoutExtension.substr(
        0,
        nameWithoutExtension.replace(separators, '-').lastIndexOf(lang) - 1,
      );
      language = lang;
      break;
    }
  }

  if (!language) {
    language = prefix = nameWithoutExtension;
  }

  return {
    fileName,
    filePath,
    prefix,
    language,
  };
};

interface IFileDetails {
  fileName: string;
  filePath: string;
  language: string;
  prefix: string;
}
