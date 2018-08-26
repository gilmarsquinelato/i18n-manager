const windowMenu: Electron.MenuItemConstructorOptions = {
  role: 'window',
  submenu: [
    { role: 'minimize' },
    { role: 'close' },
  ],
};

if (process.platform === 'darwin') {
  (windowMenu.submenu as any).push(
    { role: 'close' },
    { role: 'minimize' },
    { role: 'zoom' },
    { type: 'separator' },
    { role: 'front' },
  );
}

export default windowMenu;
