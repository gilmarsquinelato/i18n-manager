import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';


let ipcRenderer = {
  on: (message: string, cb: Function) => {
  },
  removeListener: (message: string, cb: Function) => {
  },
  send: (message: string, data: any) => {
  },
};

if (window.require) {
  const electron = window.require('electron');
  ipcRenderer = electron.ipcRenderer;
}


@Injectable({
  providedIn: 'root'
})
export class IpcService {

  constructor(
    private ngZone: NgZone,
  ) {
  }

  on = (message: string): Observable<any> => Observable.create((observer) => {
    const onMessage = (event: any, data: any) => {
      this.ngZone.run(() => {
        observer.next({event, data});
      });
    };

    ipcRenderer.on(message, onMessage);

    return () => {
      ipcRenderer.removeListener(message, onMessage);
    };
  });

  send = (message: string, data: any = null) => {
    this.ngZone.run(() => {
      ipcRenderer.send(message, data);
    });
  }
}
