// import { init } from '@sentry/electron';
import { app } from 'electron';
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS
} from 'electron-devtools-installer';

// import { sentryConfig } from '../common/sentry';
import loadMenu from './menu';
import { hasWindows, createWindow } from './windowManager';
import registerAppEvents from './events';

const isDev = require('electron-is-dev');


// if (!isDev) {
//   init(sentryConfig);
// }

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

  if (isDev) {
    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
      .then((name) => console.log(`Added Extension:  ${name}`))
      .catch((err) => console.log('An error occurred: ', err));
  }
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
