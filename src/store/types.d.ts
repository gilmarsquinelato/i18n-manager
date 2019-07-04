import { IFolderState } from '@src/folder/store/types';
import { IHomeState } from '@src/home/store/types';
import { ISettingsState } from '@src/settings/store/types';


export interface IStoreState {
  home: IHomeState;
  folder: IFolderState;
  settings: ISettingsState;
}
