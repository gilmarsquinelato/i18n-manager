import { Store } from 'vuex';
import { IpcRenderer } from 'electron';
import { Action, Module, VuexModule } from 'vuex-module-decorators';

import { StoreState } from '../types';
import * as ipcMessages from '@common/ipcMessages';
import router from '@/router';
import { CustomSettings, FormattedFolderPath, LoadedPath } from '@common/types';

declare global {
  interface Window {
    require: (
      module: 'electron',
    ) => {
      ipcRenderer: IpcRenderer;
    };
  }
}

const { ipcRenderer } = window.require('electron');

export const ipcPlugin = (store: Store<StoreState>) => {
  Object.values(ipcMessages).forEach(message => {
    ipcRenderer.on(message, (event, data) => {
      store.dispatch(`ipc/${message}`, data);
    });
  });
};

export const sendIpc = (message: keyof typeof ipcMessages, data?: any) =>
  ipcRenderer.send(message, data);

@Module({
  namespaced: true,
})
export class IpcModule extends VuexModule {
  @Action
  showSettings() {
    this.context.commit('global/showSettings', null, { root: true });
  }

  @Action
  save(data: any) {
    this.context.dispatch('folder/save', data, { root: true });
  }

  @Action
  saveComplete(data: any) {
    this.context.dispatch('folder/saveComplete', data, { root: true });
  }

  @Action
  open(data: LoadedPath[]) {
    this.context.dispatch('folder/openFolder', data, { root: true });
  }

  dataChanged(data: any) {}

  showContextMenu(data: any) {}

  addTreeItem(data: any) {}

  removeTreeItem(data: any) {}

  renameTreeItem(data: any) {}

  @Action
  navigateTo(data: any) {
    router.push(data.path);
  }

  @Action
  settings(settings: CustomSettings) {
    this.context.dispatch('settings/loadSettings', settings, { root: true });
  }

  @Action
  saveSettings(settings: CustomSettings) {}

  @Action
  recentFolders(data: FormattedFolderPath[]) {
    this.context.dispatch('home/receiveRecentFolders', data, { root: true });
  }

  @Action
  closeFolder() {
    this.context.dispatch('folder/closeFolder', undefined, { root: true });
  }

  @Action
  refreshFolder(data: LoadedPath[]) {
    this.context.dispatch('folder/refreshFolder', data, { root: true });
  }
}
