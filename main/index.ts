import { init } from '@sentry/electron';
import _ from 'lodash';
import * as fs from 'fs';
import { app } from 'electron';
import { autoUpdater } from 'electron-updater'
import isDev from 'electron-is-dev';

import { sentryConfig } from '../common/sentry';
import loadMenu from './menu';
import { hasWindows, createWindow } from './windowManager';
import installExtensions from './devtoolsInstaller';
import registerAppEvents from './events';

if (!isDev) {
  init(sentryConfig);
}

registerAppEvents();


app.setName('i18n Manager');
app.setAboutPanelOptions({
  applicationName: 'i18n Manager',
  applicationVersion: app.getVersion(),
  copyright: 'https://www.github.com/gilmarsquinelato',
  credits: 'Gilmar Quinelato',
  version: app.getVersion(),
});


app.on('ready', () => {
  if (isDev) {
    installExtensions();
  }

  loadMenu();
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!hasWindows()) {
    createWindow();
  }
});
