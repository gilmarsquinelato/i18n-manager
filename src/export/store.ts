import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';

import { sendIpc } from '@/store/plugins/ipc';
import * as ipcMessages from '@common/ipcMessages';

@Module({
  namespaced: true,
})
export default class ExportModule extends VuexModule {
  isExportVisible = false;
  isLoading = false;

  @Action
  createXLS(data: Object) {
    sendIpc(ipcMessages.createXls, data);
  }

  @Mutation
  showExport() {
    this.isExportVisible = true;
  }

  @Mutation
  hideExport() {
    this.isExportVisible = false;
  }

  @Mutation
  showLoading() {
    this.isLoading = true;
  }

  @Mutation
  hideLoading() {
    this.isLoading = false;
  }
}
