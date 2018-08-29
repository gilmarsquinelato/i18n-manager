import * as jsonPlugin from './json';

interface Plugin {
  fileExtension: string;
  parse: (path: string) => Promise<any>;
  save: (path: string, data: any) => Promise<boolean>;
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
