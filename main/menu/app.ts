import { app } from 'electron';
import { onPreferencesClick } from './shared';

let appMenu: Electron.MenuItemConstructorOptions = {};

if (process.platform === 'darwin') {
  appMenu = {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      {
        label: 'Preferences',
        click: onPreferencesClick,
        accelerator: 'CommandOrControl+,',
      },
      { type: 'separator' },
      { role: 'services', submenu: [] },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  };
}

export default appMenu;
