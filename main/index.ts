import { init } from '@sentry/electron';
import { app } from 'electron';
import isDev from 'electron-is-dev';

import { sentryConfig } from '../common/sentry';
import loadMenu from './menu';
import { hasWindows, createWindow } from './windowManager';
import registerAppEvents from './events';

if (!isDev) {
  init(sentryConfig);
}

registerAppEvents();


app.setName('i18n Manager');
if (process.platform === 'darwin') {
  app.setAboutPanelOptions({
    applicationName: 'i18n Manager',
    applicationVersion: app.getVersion(),
    copyright: 'https://www.github.com/gilmarsquinelato',
    credits: 'Gilmar Quinelato',
    version: app.getVersion(),
  });
}


app.on('ready', () => {
  loadMenu();
  createWindow();
  // autoUpdater.checkForUpdatesAndNotify();
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
