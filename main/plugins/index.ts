import * as jsonPlugin from './json';

export interface Plugin {
  fileExtensions: string[];
  parse: (content: string) => Promise<any>;
  serialize: (data: any) => Promise<string>;
}

let plugins: Plugin[] = [
  jsonPlugin,
];

export const loadPlugins = (additionalPlugins: Plugin[]) => {
  plugins = [
    ...additionalPlugins,
    ...plugins,
  ];
};

export default () => plugins;
