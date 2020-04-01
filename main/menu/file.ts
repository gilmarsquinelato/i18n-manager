import { dialog } from 'electron';
import { openFolder } from '../fileManager';
import {
  createWindow,
  getCurrentWindow,
  SaveResponse,
  sendClose,
  sendSave,
  showSaveDialog,
} from '../windowManager';
import { onPreferencesClick } from './shared';

const newWindow = () => createWindow();

const openDirectory = async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  if (result) {
    openFolder(result.filePaths[0]);
  }
};

const closeDirectory = async () => {
  const currentWindow = getCurrentWindow();
  if (!currentWindow) {
    return;
  }

  if (!currentWindow.isDocumentEdited()) {
    sendClose(currentWindow);
    return;
  }

  const response = await showSaveDialog(currentWindow);

  if (response === SaveResponse.Save) {
    sendSave(currentWindow, { closeDirectory: true });
  } else if (response === SaveResponse.DontSave) {
    sendClose(currentWindow);
  }
};

const saveDirectory = () => {
  const currentWindow = getCurrentWindow();
  if (currentWindow) {
    sendSave(currentWindow);
  }
};

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
    {
      label: 'Close Folder',
      click: closeDirectory,
      accelerator: 'CommandOrControl+W',
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
  (fileMenu.submenu as any).push(
    { type: 'separator' },
    {
      label: 'Preferences',
      click: onPreferencesClick,
      accelerator: 'CommandOrControl+,',
    },
  );
}

export default fileMenu;
