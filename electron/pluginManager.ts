import plugins from './plugins';

export const getAvailablePlugins = () => plugins;


export type ParsedFile = {
  path: string,
  data: object,
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
  plugins
    .filter(plugin => path.endsWith(plugin.fileExtension))[0];