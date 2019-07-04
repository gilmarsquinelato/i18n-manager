import { ipcRenderer } from 'electron';
import { eventChannel } from 'redux-saga';


export const ipcChannel = <Data>(messageChannel: string) => eventChannel(emitter => {
  const cb = (event: any, data: Data) => emitter(data);
  ipcRenderer.on(messageChannel, cb);
  return () => ipcRenderer.removeListener(messageChannel, cb);
});

export default ipcRenderer;
