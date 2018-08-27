import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';


export default () => {
  const sagaMiddleware = createSagaMiddleware()
  const enhancer = composeWithDevTools(
    applyMiddleware(sagaMiddleware),
  );

  const store = createStore(rootReducer, enhancer);
  let sagaTask = sagaMiddleware.run(rootSaga);

  const hot = (module as any).hot;
  if(hot) {
    hot.accept('./rootReducer', () => {
      store.replaceReducer(require('./rootReducer').default);
    });

    hot.accept('./rootSaga', () => {
      sagaTask.cancel();
      sagaTask.done.then(() => {
        sagaTask = sagaMiddleware.run(require('./rootSaga').default);
      });
    });
}

  return store;
};
