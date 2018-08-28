import * as testUtils from './testUtils';
import * as fileManager from '../fileManager';
import * as pluginManager from '../pluginManager';


const validateParsedFile = (parsedFile: pluginManager.ParsedFile, language: string) => {
  expect(parsedFile.filePath).toBe(`${testUtils.basePath}/${language}.json`);
  expect(parsedFile.fileName).toBe(`${language}.json`);
  expect(parsedFile.language).toBe(language);
  expect(parsedFile.data.language).toBe(language);
};

describe('pluginManager', () => {
  beforeEach(() => {
    testUtils.mockAll();
  });

  it('getParsedFiles', async () => {
    const files = await fileManager.getFiles(testUtils.basePath);
    const parsedFiles = await pluginManager.getParsedFiles(files);

    validateParsedFile(parsedFiles[0], 'en');
    validateParsedFile(parsedFiles[1], 'es');
    validateParsedFile(parsedFiles[2], 'pt-BR');
  });
});
