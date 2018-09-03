import { dialog } from 'electron';
import { openFolder } from '../fileManager';
import { createWindow, getCurrentWindow, sendSave } from '../windowManager';
import { onPreferencesClick } from './shared';
import { IMenuOptions } from '../../common/types';


const newWindow = () => createWindow();

const openDirectory = () => {
  const result = dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (result) {
    openFolder(result[0]);
  }
};

const saveDirectory = () => {
  sendSave(getCurrentWindow());
};


export default (): Electron.MenuItemConstructorOptions => {
  const fileMenu: Electron.MenuItemConstructorOptions = {
    label: 'File',
    submenu: [
      {
        label: 'New Window',
        click: newWindow,
        accelerator: 'CommandOrControl+Shift+N',
      },
      { type: 'separator' },
      {
        label: 'Open Folder',
        click: openDirectory,
        accelerator: 'CommandOrControl+O',
      },
      { type: 'separator' },
      {
        label: 'Save',
        click: saveDirectory,
        accelerator: 'CommandOrControl+S',
      },
    ],
  };
  if (process.platform === 'linux') {
    (fileMenu.submenu as any).push({ type: 'separator' }, {
      label: 'Preferences',
      click: onPreferencesClick,
      accelerator: 'CommandOrControl+,',
    });
  }
  return fileMenu;
};
