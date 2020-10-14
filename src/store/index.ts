import Vue from 'vue';
import Vuex from 'vuex';

import { StoreState } from './types';
import { ipcPlugin, IpcModule as ipc } from './plugins/ipc';
import global from './modules/global';
import home from '@/home/store';
import folder from '@/folder/store';
import settings from '@/settings/store';
import exportModule from '@/export/store'

Vue.use(Vuex);

export default new Vuex.Store<StoreState>({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    ipc,
    global,
    home,
    folder,
    settings,
    export: exportModule
  },
  plugins: [ipcPlugin],
});
