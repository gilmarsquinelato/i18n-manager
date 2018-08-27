import * as jsonPlugin from './json';

interface Plugin {
  fileExtension: string;
  parse: (path: string) => any;
  save: (path: string, data: any) => boolean;
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
