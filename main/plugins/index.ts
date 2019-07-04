import * as jsonPlugin from './json';
import * as yamlPlugin from './yaml';

export interface IPlugin {
  fileExtensions: string[];
  parse: (content: string) => Promise<any | undefined>;
  serialize: (data: any) => Promise<string | undefined>;
}

let plugins: IPlugin[] = [
  jsonPlugin,
  yamlPlugin,
];

export const loadPlugins = (additionalPlugins: IPlugin[]) => {
  plugins = [
    ...additionalPlugins,
    ...plugins,
  ];
};

export default () => plugins;
