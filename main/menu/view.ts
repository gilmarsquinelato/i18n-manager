import isDev from 'electron-is-dev';


const viewMenu: Electron.MenuItemConstructorOptions = {
  label: 'View',
  submenu: [
    { role: 'resetzoom' },
    { role: 'zoomin' },
    { role: 'zoomout' },
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
