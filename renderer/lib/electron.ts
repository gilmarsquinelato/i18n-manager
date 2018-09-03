import { eventChannel } from 'redux-saga';
import * as ipcMessages from '../../common/ipcMessages';


let ipcRenderer = {
  on: (message: string, cb: Function) => {},
  removeListener: (message: string, cb: Function) => {},
  send: (message: string, data: any) => {},
};

if (window.require) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}


export const createIpcChannel = (message: string) =>
  eventChannel((emit) => {
    const onMessage = (event: any, data: any) => {
      emit({
        event,
        data,
      });
    };

    ipcRenderer.on(message, onMessage);

    return () => {
      ipcRenderer.removeListener(message, onMessage);
    };
  });


export const openFolderChannel = createIpcChannel(ipcMessages.open);
export const saveFolderChannel = createIpcChannel(ipcMessages.save);
export const saveFolderCompleteChannel = createIpcChannel(ipcMessages.saveComplete);
export const addTreeItemChannel = createIpcChannel(ipcMessages.addTreeItem);
export const removeTreeItemChannel = createIpcChannel(ipcMessages.removeTreeItem);
export const navigateToChannel = createIpcChannel(ipcMessages.navigateTo);
export const settingsChannel = createIpcChannel(ipcMessages.settings);
export const setRecentFoldersChannel = createIpcChannel(ipcMessages.recentFolders);

export const sendToIpc = (message: string, data?: any) =>
  ipcRenderer.send(message, data);
