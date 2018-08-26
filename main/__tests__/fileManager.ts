import * as testUtils from './testUtils';
import * as electron from 'electron';

import * as fileManager from '../fileManager';
import * as pluginManager from '../pluginManager';
import * as ipcMessages from '../../common/ipcMessages';


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
});
