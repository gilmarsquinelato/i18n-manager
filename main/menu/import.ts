import { dialog } from 'electron';
import { openFile } from '../fileManager';
import * as windowManager from '../windowManager';

const openDirectory = async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    filters: [
      { name: 'Supported files xls / xlsx', extensions: ['xls', 'xlsx'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });
  if (!canceled) {
    openFile(filePaths[0]);
  }
};

const openExport = async () => {
  const window = windowManager.getCurrentWindow();
  if (!window) {
    return;
  }

  windowManager.sendShowExport(window);
};

const importMenu: Electron.MenuItemConstructorOptions = {
  label: 'Import / Export',
  submenu: [
    {
      label: 'Import From XLSX',
      click: openDirectory,
    },
    {
      label: 'Export To XLSX or CSV',
      click: openExport,
    },
  ],
};

export default importMenu;
