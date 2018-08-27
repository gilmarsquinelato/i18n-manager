import * as Sentry from '@sentry/electron';
import _ from 'lodash';
import { app } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import installExtension, {
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from 'electron-devtools-installer';

import { setupSentry } from '../common/sentry';
import loadMenu from './menu';
import { hasWindows, createWindow } from './windowManager';

setupSentry(Sentry);


if (isDev) {
  const reload = require('electron-reload');
  const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');
  reload(__dirname, { electron: electronPath });

  installExtension(REDUX_DEVTOOLS);
  installExtension(REACT_DEVELOPER_TOOLS);
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
