import * as React from 'react';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router/immutable';
import {
  Switch,
  Route,
} from 'react-router-dom';

import createStore from './config/redux';

import { FolderContainer } from './folder';

const history = createBrowserHistory();
const store = createStore(history);

const Routes: React.SFC = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/" exact component={FolderContainer} />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default Routes;
