import { app } from 'electron';
import * as _ from 'lodash';
import * as path from 'path';
import * as fs from 'fs';


export interface Settings {
  window: {
    width: number,
    height: number,
  },
  customSettings: {},
  recentFolders: string[],
}

export const defaultSettings: Settings = {
  window: {
    width: 1024,
    height: 768,
  },
  customSettings: {},
  recentFolders: [],
};

const settingsFilePath = path.join(app.getPath('userData'), 'settings.json');

export const getSavedSettings = (): Settings => {
  const existsSettingsFile = fs.existsSync(settingsFilePath);
  if (!existsSettingsFile) {
    return defaultSettings;
  }

  const file = fs.readFileSync(settingsFilePath);
  const parsed = JSON.parse(file.toString());
  return _.merge(defaultSettings, parsed);
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
  return getCustomSettings();
};

export const getRecentFolders = (): string[] => {
  return getSavedSettings().recentFolders || [];
};

export const addRecentFolder = (folderPath: string) => {
  const settings = getSavedSettings();

  const duplicatedIndex = settings.recentFolders.indexOf(folderPath);
  if (duplicatedIndex !== -1) {
    settings.recentFolders.splice(duplicatedIndex, 1);
  }

  settings.recentFolders.unshift(folderPath);
  settings.recentFolders = settings.recentFolders.slice(0, 10);

  saveSettings(settings);
  return getRecentFolders();
};
