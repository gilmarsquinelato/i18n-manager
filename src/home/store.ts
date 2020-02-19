import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import { FormattedFolderPath } from '@common/types';
import packageJson from '../../package.json';

const RELEASES_URL = 'https://api.github.com/repos/gilmarsquinelato/i18n-manager/releases';

@Module({
  namespaced: true,
})
export default class HomeModule extends VuexModule {
  recentFolders: FormattedFolderPath[] = [];
  currentVersion: string = packageJson.version;
  latestVersion = '';

  @Action({ commit: 'setRecentFolders' })
  receiveRecentFolders(data: FormattedFolderPath[]) {
    return data;
  }

  @Mutation
  setRecentFolders(folders: FormattedFolderPath[]) {
    this.recentFolders = folders;
  }

  @Action({ commit: 'setLatestVersion' })
  async checkVersion() {
    try {
      const response = await fetch(RELEASES_URL);
      const releases: any[] = await response.json();
      const latestRelease = releases[0];
      return latestRelease.name;
    } catch (e) {
      //
    }

    return '';
  }

  @Mutation
  setLatestVersion(version: string) {
    this.latestVersion = version;
  }
}
