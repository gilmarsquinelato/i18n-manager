import { dialog } from 'electron';

const helpMenu: Electron.MenuItemConstructorOptions = {
  role: 'help',
  submenu: [
    {
      label: 'Learn More',
      click() { require('electron').shell.openExternal('https://electronjs.org'); },
    },
  ],
};

export default helpMenu;
