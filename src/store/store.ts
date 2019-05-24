import { createStore } from 'easy-peasy';

import ipcRenderer from '../ipcRenderer';
import { IStoreModel, StoreConfig } from './types';
import home from '../home/store';
import folder from '../folder/store';

const store = createStore<IStoreModel, StoreConfig>(
  {
    home,
    folder,
  },
  {
    injections: {
      ipc: ipcRenderer
    }
  });

export default store;

store.dispatch.home.subscribe();
