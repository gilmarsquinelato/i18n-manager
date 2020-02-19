import { Module, Mutation, VuexModule } from 'vuex-module-decorators';

@Module({ namespaced: true })
export default class GlobalModule extends VuexModule {
  isSettingsVisible = false;

  @Mutation
  showSettings() {
    this.isSettingsVisible = true;
  }

  @Mutation
  hideSettings() {
    this.isSettingsVisible = false;
  }
}
