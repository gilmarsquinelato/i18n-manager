import * as testUtils from './testUtils';
import * as plugins from '../plugins';
import * as fileManager from '../fileManager';
import * as pluginManager from '../pluginManager';


describe('pluginManager', () => {
  beforeEach(() => {
    testUtils.mockAll();
  });

  it('getParsedFiles', async () => {
    const files = await fileManager.getFiles(testUtils.basePath);
    const parsedFiles = await pluginManager.getParsedFiles(files);

    expect(parsedFiles[0].path).toBe(`${testUtils.basePath}/en.json`);
    expect(parsedFiles[0].data.language).toBe('en');

    expect(parsedFiles[1].path).toBe(`${testUtils.basePath}/es.json`);
    expect(parsedFiles[1].data.language).toBe('es');

    expect(parsedFiles[2].path).toBe(`${testUtils.basePath}/pt-BR.json`);
    expect(parsedFiles[2].data.language).toBe('pt-BR');
  });
});
