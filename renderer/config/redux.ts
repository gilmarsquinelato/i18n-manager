import { combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import folder from '~/folder/reducers';

export default () => {
  const rootReducer = combineReducers({
    folder
  });

  const enhancer = composeWithDevTools();
  const store = createStore(rootReducer, enhancer);

  return store;
};
