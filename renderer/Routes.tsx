import * as React from 'react';
import { Provider } from 'react-redux';
import { createBrowserHistory, createHashHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router/immutable';
import {
  Switch,
  Route,
} from 'react-router-dom';
import { hot } from 'react-hot-loader';

import createStore from './config/redux';

import { HomeContainer } from './home';
import { FolderContainer } from './folder';
import { SettingsContainer } from './settings';


const history = createHashHistory();
const store = createStore(history);

const Routes: React.SFC = () => (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <Switch>
        <Route path="/" exact component={HomeContainer} />
        <Route path="/folder" component={FolderContainer} />
        <Route path="/settings" component={SettingsContainer} />
      </Switch>
    </ConnectedRouter>
  </Provider>
);

export default hot(module)(Routes);
