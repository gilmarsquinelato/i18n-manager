jest.mock('fs');
jest.mock('electron');

import * as settings from '../settings';

const MOCK_FILE_INFO = {
};

describe('fileManager', () => {
  beforeEach(() => {
    require('fs').__setMockFiles(MOCK_FILE_INFO);
  });

  it('getSavedSettings', () => {
    const savedSettings = settings.getSavedSettings();

    expect(savedSettings).toBeDefined();
    expect(savedSettings).toEqual(settings.defaultSettings);
  });

  it('saveSettings', async () => {
    const newSettings = { window: { width: 1, height: 2 }, customSettings: {} };
    const savedSettings = await settings.saveSettings(newSettings);

    expect(savedSettings).toBeDefined();
    expect(savedSettings).toEqual(newSettings);
  });
});
