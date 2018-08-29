import * as testUtils from './testUtils';
import * as electron from 'electron';

import * as fileManager from '../fileManager';
import * as pluginManager from '../pluginManager';
import * as ipcMessages from '../../common/ipcMessages';
import { ParsedFile } from '../../common/types';


describe('fileManager', () => {
  beforeEach(() => {
    testUtils.mockAll();
  });

  it('getFiles', async () => {
    const files = await fileManager.getFiles(testUtils.basePath);
    expect(files.length).toBe(3);
  });

  it('openFolder', async () => {
    const files = await fileManager.getFiles(testUtils.basePath);
    const parsedFiles = await pluginManager.getParsedFiles(files);

    await fileManager.openFolder(testUtils.basePath);
    expect((electron as any).webContentsSendFunction).toBeCalledWith(ipcMessages.open, parsedFiles);
  });

  it('saveFolder', async () => {
    const language = 'pt-PT';
    const fileName = `${language}.json`;
    const filePath = `${testUtils.basePath}/${language}.json`;

    const filesToSave: ParsedFile[] = [
      {
        language,
        fileName,
        filePath,
        data: { language },
      },
    ];

    const failedToSaveFiles = await fileManager.saveFolder(filesToSave);

    const files = require('fs').getFiles();
    const savedFile = files[filePath];

    expect(failedToSaveFiles.length).toBe(0);
    expect(savedFile).toBeDefined();
    expect(JSON.parse(savedFile).language).toBe(language);
  });
});
