import { EasyPeasyConfig, Store, Thunk } from 'easy-peasy';

import { IFolderModel } from '../folder/store/types';
import { IHomeModel } from '../home/store';
import ipcRenderer from '../ipcRenderer';

export interface IStoreModel {
  home: IHomeModel;
  folder: IFolderModel;
}

export interface IInjections {
  ipc: typeof ipcRenderer;
}

export type StoreConfig = EasyPeasyConfig<{}, IInjections>;

export type AppStore = Store<IStoreModel, StoreConfig>;

export type AppThunk<TModel = any, TPayload = any> = Thunk<TModel, TPayload, IInjections>;
