import * as Sentry from '@sentry/electron';
import _ from 'lodash';
import { app, dialog } from 'electron';
import isDev from 'electron-is-dev';

import { setupSentry } from '../common/sentry';
import loadMenu from './menu';
import { hasWindows, createWindow } from './windowManager';
import installExtensions from './devtoolsInstaller';
import registerAppEvents from './events';


if (!isDev) {
  setupSentry(Sentry);
}

registerAppEvents();

app.on('ready', () => {
  if (isDev) {
    installExtensions();
  }

  loadMenu();
  createWindow();
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
