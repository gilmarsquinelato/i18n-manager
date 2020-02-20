import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { CustomSettings } from '@common/types';
import { sendIpc } from '@/store/plugins/ipc';
import * as ipcMessages from '@common/ipcMessages';

@Module({
  namespaced: true,
})
export default class SettingsModule extends VuexModule {
  settings: CustomSettings = {
    googleTranslateApiKey: '',
  };

  @Action({ commit: 'setSettings' })
  loadSettings(settings: CustomSettings) {
    return settings;
  }

  @Action({ commit: 'setSettings' })
  saveSettings(settings: CustomSettings) {
    sendIpc(ipcMessages.saveSettings, settings);
    this.context.commit('global/hideSettings', null, { root: true });
    return settings;
  }

  @Mutation
  setSettings(settings: CustomSettings) {
    this.settings = settings;
  }
}
