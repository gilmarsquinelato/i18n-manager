import { app } from 'electron';
import * as util from 'util';
import * as path from 'path';
import * as fs from 'fs';


type Settings = {
  window: {
    width: number,
    height: number,
  },
};

export const defaultSettings: Settings = {
  window: {
    width: 800,
    height: 600,
  },
};

const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

export const getSavedSettings = () => {
  const existsSettingsFile = fs.existsSync(settingsFilePath);
  if (!existsSettingsFile) {
    return defaultSettings;
  }

  const file = fs.readFileSync(settingsFilePath);
  return JSON.parse(file.toString());
};

export const saveSettings = async (settings: Settings) => {
  await util.promisify(fs.writeFile)(
    settingsFilePath,
    JSON.stringify(settings, null, 2),
  );

  return getSavedSettings();
};
