import * as jsonPlugin from './json';
import { parse } from 'url';

interface Plugin {
  fileExtension: string,
  parse: (path: string) => object,
  save: (path: string, data: object) => boolean,
}

const plugins: Plugin[] = [
  jsonPlugin,
];

export default plugins;
