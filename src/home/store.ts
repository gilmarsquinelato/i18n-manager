import { action, Action, thunk } from 'easy-peasy';

import * as ipcMessages from '../ipcMessages';
import { IFormattedFolderPath } from '../../typings';
import { AppThunk } from '../store/types';


export interface IHomeModel {
  // states
  recentFolders: IFormattedFolderPath[];
  // actions
  setRecentFolders: Action<IHomeModel, IFormattedFolderPath[]>;
  // effects
  subscribe: AppThunk<IHomeModel, void>;
}

const state: Partial<IHomeModel> = {
  recentFolders: [],
};

const actions: Partial<IHomeModel> = {
  setRecentFolders: action((state, payload) => {
    state.recentFolders = payload;
  }),
};

const effects: Partial<IHomeModel> = {
  subscribe: thunk((actions, _, {injections}) => {
    const {ipc} = injections;
    ipc.on(ipcMessages.recentFolders, (_: any, data: IFormattedFolderPath[]) => {
      actions.setRecentFolders(data);
    });
    ipc.send(ipcMessages.recentFolders, {});
  }),
};

export default {
  ...state,
  ...actions,
  ...effects,
} as IHomeModel;
