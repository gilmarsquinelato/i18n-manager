import { IFolderModel } from './types';
import state from './state';
import actions from './actions';
import effects from './effects';

export default {
  ...state,
  ...actions,
  ...effects,
} as IFolderModel;
