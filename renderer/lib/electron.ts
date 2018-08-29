import { eventChannel } from 'redux-saga';

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

export const sendToIpc = (message: string, data: any) =>
  ipcRenderer.send(message, data);
