import { shell } from 'electron';

const helpMenu: Electron.MenuItemConstructorOptions = {
  role: 'help',
  submenu: [
    {
      label: 'Project Repository',
      click: () => shell.openExternal('https://github.com/gilmarsquinelato/i18n-manager'),
    },
  ],
};

export default helpMenu;
