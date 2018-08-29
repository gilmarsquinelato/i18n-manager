import { dialog } from 'electron';
import { openFolder } from '../fileManager';
import { createWindow, getCurrentWindow, sendSave } from '../windowManager';


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


const fileMenu: Electron.MenuItemConstructorOptions = {
  label: 'File',
  submenu: [
    {
      label: 'New Window',
      click: createWindow,
      accelerator: 'CommandOrControl+Shift+N',
    },
    { type: 'separator' },
    {
      label: 'Open',
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

export default fileMenu;
