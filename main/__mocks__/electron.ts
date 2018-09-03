export const webContentsSendFunction = jest.fn();
export const browserWindowConstructorFunction = jest.fn();


const windowList: BrowserWindow[] = [];

export class BrowserWindow {
  static getAllWindows = jest.fn().mockReturnValue(windowList);
  static fromWebContents = jest.fn(w => w);

  options: any;

  constructor(options: any) {
    this.options = options;
    browserWindowConstructorFunction(options);
    windowList.push(this);
  }

  webContents = {
    send: webContentsSendFunction,
    isLoading: () => false,
  };

  loadURL = jest.fn();
  setMenu = jest.fn();

  events: any = {};

  on = (eventName: string, callback: (...args: any[]) => any) => {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(jest.fn(callback));
  }
  once = this.on;

  trigger = async (eventName: string, event: Electron.Event) => {
    await Promise.all(this.events[eventName].map((fn: any) => fn.call(event)));
  }

  documentEdited: boolean = false;

  isDocumentEdited = () => this.documentEdited;

  setDocumentEdited = (edited: boolean) => {
    this.documentEdited = edited;
  }

  destroy = jest.fn(() => {
    const index = windowList.indexOf(this);
    windowList.splice(index, 1);
  });

  getSize = () => ([this.options.width, this.options.height]);

  show = jest.fn();
  focus = jest.fn();
}


const appEvents: any = {};
export const app = {
  getName: () => 'i18n Manager',
  getPath: (path: string) => `./appPath/${path}`,

  on: (eventName: string, callback: (...args: any[]) => any) => {
    appEvents[eventName] = jest.fn(callback);
  },

  trigger: async (eventName: string, event: any) => {
    const fn = appEvents[eventName];
    await fn(event);
  },

  addRecentDocument: jest.fn(),
};

let dialogReturns = 0;
export const setDialogReturns = (value: number) => {
  dialogReturns = value;
};

export const remote = jest.fn();
export const dialog = {
  showMessageBox: jest.fn((window: any, options: any, callback: (response: number) => any) =>
    callback(dialogReturns)),
};

export const Menu = {
  buildFromTemplate: jest.fn(),
  setApplicationMenu: jest.fn(),
};

export const ipcEvents: any = {};
export const ipcMain = {
  on: (event: string, cb: any) => {
    ipcEvents[event] = jest.fn(cb);
  },
  async trigger(eventName: string, event: Electron.Event, data: any) {
    const fn = ipcEvents[eventName];
    await fn(event, data);
  },
};

export default {
  require: jest.fn(),
};
