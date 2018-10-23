import { Observable } from 'rxjs';
import { NgZone } from '@angular/core';


let ipcRenderer = {
  on: (message: string, cb: Function) => {},
  removeListener: (message: string, cb: Function) => {},
  send: (message: string, data: any) => {},
};

if (window.require) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}

export const createIpc = (ngZone, message) => Observable.create((observer) => {
  const onMessage = (event: any, data: any) => {
    ngZone.run(() => {
      observer.next({
        event,
        data,
      });
    });
  };

  ipcRenderer.on(message, onMessage);

  return () => {
    ipcRenderer.removeListener(message, onMessage);
  };
});

export const sendToIpc = (message: string, data?: any) => {
  console.log(ipcRenderer);
  ipcRenderer.send(message, data);
};
