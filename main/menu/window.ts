import { onPreferencesClick } from './shared';

const windowMenu: Electron.MenuItemConstructorOptions = {
  role: 'window',
  submenu: [{ role: 'minimize' }, { role: 'close' }],
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

if (process.platform === 'win32') {
  (windowMenu.submenu as any).push(
    { type: 'separator' },
    {
      label: 'Preferences',
      click: onPreferencesClick,
      accelerator: 'CommandOrControl+,',
    },
  );
}

export default windowMenu;
