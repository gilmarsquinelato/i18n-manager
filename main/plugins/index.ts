import * as jsonPlugin from './json';
import { parse } from 'url';

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
