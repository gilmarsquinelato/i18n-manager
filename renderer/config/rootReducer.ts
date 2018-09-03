import { combineReducers } from 'redux-immutable';

import folder from '~/folder/reducers';
import home from '~/home/reducers';
import settings from '~/settings/reducers';


export default combineReducers({
  folder,
  home,
  settings,
});
