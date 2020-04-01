const isDev = require('electron-is-dev');

const viewMenu: Electron.MenuItemConstructorOptions = {
  label: 'View',
  submenu: [
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' },
  ],
};

if (isDev) {
  (viewMenu.submenu as any).unshift(
    { role: 'reload' },
    { role: 'forcereload' },
    { role: 'toggledevtools' },
    { type: 'separator' },
  );
}

export default viewMenu;
