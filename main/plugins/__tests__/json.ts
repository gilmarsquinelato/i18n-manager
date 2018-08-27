jest.mock('fs');

import * as json from '../json';

export const basePath = '/mock/test/folder';
export const MOCK_FILE_INFO = {
  [`${basePath}/en.json`]: '{ "language": "en" }',
  [`${basePath}/wrong.json`]: '{ "language": "none"',
};

describe('plugins/json', () => {
  beforeEach(() => {
    require('fs').__setMockFiles(MOCK_FILE_INFO);
  });

  it('parsing file', async () => {
    const data = await json.parse(`${basePath}/en.json`);
    expect(data).toBeDefined();
    expect(data.language).toBe('en');
  });

  it('handling wrong file format', async () => {
    const data = await json.parse(`${basePath}/wrong.json`);
    expect(data).toBeNull();
  });
});
