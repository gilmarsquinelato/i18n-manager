import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import createSagaMiddleware from 'redux-saga';

import { reducer as folder } from '@src/folder/store';
import { reducer as home } from '@src/home/store';
import { reducer as settings } from '@src/settings/store';
import rootSaga from './saga';


const composeEnhancers =
  (process.env.NODE_ENV !== 'production' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const sagaMiddleware = createSagaMiddleware({});

const reducers = enableBatching(
  combineReducers({
    folder,
    home,
    settings,
  }),
);

const middlewares = composeEnhancers(
  applyMiddleware(sagaMiddleware),
);

export default () => {
  const store = createStore(reducers, middlewares);
  sagaMiddleware.run(rootSaga);

  return store;
};
