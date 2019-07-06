// import { init } from '@sentry/electron';
import { app } from 'electron';
import electronIsDev = require('electron-is-dev');

// import { sentryConfig } from '../common/sentry';
import registerAppEvents from './events';
import loadMenu from './menu';
import { createWindow, hasWindows } from './windowManager';


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


const installDevTools = () => {
  if (electronIsDev) {
    const {
      default: installExtension,
      REACT_DEVELOPER_TOOLS,
      REDUX_DEVTOOLS,
    } = require('electron-devtools-installer');

    installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS])
      .then((name: any) => console.log('Added Extension: ', name))
      .catch((err: any) => console.log('An error occurred: ', err));
  }
};

app.on('ready', () => {
  loadMenu();
  createWindow();

  installDevTools();
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
