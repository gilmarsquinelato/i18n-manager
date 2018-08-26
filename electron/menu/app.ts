import { app } from 'electron';

let appMenu: Electron.MenuItemConstructorOptions = null;

if (process.platform === 'darwin') {
  appMenu = {
    label: app.getName(),
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  };
}

export default appMenu;
