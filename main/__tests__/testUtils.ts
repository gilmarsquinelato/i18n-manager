jest.mock('fs');
jest.mock('electron');

import * as plugins from '../plugins';

export const basePath = '/mock/test/folder';
export const MOCK_FILE_INFO = {
  [`${basePath}/en.json`]: '{ "language": "en" }',
  [`${basePath}/es.json`]: '{ "language": "es" }',
  [`${basePath}/pt-BR.json`]: '{ "language": "pt-BR" }',
  [`${basePath}/folder`]: '',
};

export const jsonPlugin = {
  fileExtension: '.json',
  parse: (path: string) => JSON.parse(MOCK_FILE_INFO[path]),
  save: () => true,
};

export const mockAll = () => {
  require('fs').__setMockFiles(MOCK_FILE_INFO);
  plugins.loadPlugins([jsonPlugin]);
};

it('ignore', () => {});
