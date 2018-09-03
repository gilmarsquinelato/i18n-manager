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
    expect(electron.BrowserWindow.getAllWindows()).toHaveLength(1);
    (electron.BrowserWindow.getAllWindows()[0] as any).trigger('ready-to-show');

    const expected: any = { folder: parsedFiles, folderPath: testUtils.basePath };
    expect((electron as any).webContentsSendFunction).toBeCalledWith(ipcMessages.open, expected);
  });

  it('saveFolder', async () => {
    const language = 'pt-PT';
    const extension = '.json';
    const fileName = `${language}${extension}`;
    const filePath = `${testUtils.basePath}/${language}${extension}`;

    const filesToSave: ParsedFile[] = [
      {
        language,
        fileName,
        filePath,
        extension,
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
