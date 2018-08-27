import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { History } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router/immutable';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';


export default (history: History) => {
  const sagaMiddleware = createSagaMiddleware();

  const enhancer = composeWithDevTools(applyMiddleware(
    sagaMiddleware,
    routerMiddleware(history),
  ));

  const store = createStore(
    connectRouter(history)(rootReducer),
    enhancer,
  );
  let sagaTask = sagaMiddleware.run(rootSaga);

  const hot = (module as any).hot;
  if (hot) {
    hot.accept('./rootReducer', () => {
      const reducer = require('./rootReducer').default;
      store.replaceReducer(connectRouter(history)(reducer));
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
