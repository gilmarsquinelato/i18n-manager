import { eventChannel } from 'redux-saga';

let ipcRenderer = {
  on: (message: string, cb: Function) => {},
  removeListener: (message: string, cb: Function) => {},
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
