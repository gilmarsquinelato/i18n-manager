import { IFormattedFolderPath } from '@typings/index';

export interface IHomeState {
  recentFolders: IFormattedFolderPath[];
  currentVersion: string;
  latestVersion: string;
}
