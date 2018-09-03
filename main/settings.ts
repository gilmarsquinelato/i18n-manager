import { app } from 'electron';
import * as path from 'path';
import * as fs from 'fs';


type Settings = {
  window: {
    width: number,
    height: number,
  },
  customSettings: {
  },
};

export const defaultSettings: Settings = {
  window: {
    width: 800,
    height: 600,
  },
  customSettings: {

  },
};

const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

export const getSavedSettings = (): Settings => {
  const existsSettingsFile = fs.existsSync(settingsFilePath);
  if (!existsSettingsFile) {
    return defaultSettings;
  }

  const file = fs.readFileSync(settingsFilePath);
  return JSON.parse(file.toString());
};

export const saveSettings = (settings: Settings) => {
  fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));

  return getSavedSettings();
};

export const getCustomSettings = () => {
  return getSavedSettings().customSettings || {};
};

export const saveCustomSettings = (data: any) => {
  const settings = getSavedSettings();
  settings.customSettings = data;

  saveSettings(settings);
  return getSavedSettings().customSettings || {};
};
