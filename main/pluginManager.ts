import getPlugins from './plugins';


export type ParsedFile = {
  path: string,
  data: any,
};

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

export const openFile = async (path: string): Promise<ParsedFile> => {
  const plugin = getPluginForFile(path);
  if (!plugin) {
    return null;
  }

  return {
    path,
    data: await plugin.parse(path),
  };
};

const getPluginForFile = (path: string) =>
getPlugins()
    .filter(plugin => path.endsWith(plugin.fileExtension))[0];
