jest.mock('fs');
jest.mock('electron');


export const basePath = '/mock/test/folder';
export const MOCK_FILE_INFO = {
  [`${basePath}/en.json`]: '{ "language": "en" }',
  [`${basePath}/es.json`]: '{ "language": "es" }',
  [`${basePath}/pt-BR.json`]: '{ "language": "pt-BR" }',
  [`${basePath}/folder`]: '',
};

export const mockAll = () => {
  require('fs').__setMockFiles(MOCK_FILE_INFO);
};

it('ignore', () => {});
