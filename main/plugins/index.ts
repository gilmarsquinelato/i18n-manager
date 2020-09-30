import * as jsonPlugin from './json';
import * as yamlPlugin from './yaml';
import * as javascriptPlugin from './javascript';

export interface IPlugin {
  fileExtensions: string[];
  parse: (content: string) => Promise<any | undefined>;
  serialize: (data: any, oldFileContent: string) => Promise<string | undefined>;
}

let plugins: IPlugin[] = [
  jsonPlugin,
  yamlPlugin,
  javascriptPlugin,
];

export const loadPlugins = (additionalPlugins: IPlugin[]) => {
  plugins = [
    ...additionalPlugins,
    ...plugins,
  ];
};

export default () => plugins;
