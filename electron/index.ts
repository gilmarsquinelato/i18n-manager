import _ from 'lodash';
import { app } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';

import loadMenu from './menu';
import { hasWindows, createWindow } from './windowManager';

const Sentry = require('@sentry/electron');

Sentry.init({
  dsn: 'https://f55d7c8072cd44d7897d43c9b5294d3d@sentry.io/1268922',
});


if (isDev) {
  const reload = require('electron-reload');
  const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
  reload(__dirname, { electron: electronPath });
}

app.on('ready', () => {
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
