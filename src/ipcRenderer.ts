let ipcRenderer = {
  on: (message: string, cb: Function) => {},
  removeListener: (message: string, cb: Function) => {},
  send: (message: string, data: any) => {},
};

if ((window as any).require) {
  ipcRenderer = (window as any).require('electron').ipcRenderer;
}

export default ipcRenderer;
