import * as React from 'react';
import { Provider } from 'react-redux';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import createStore from './config/redux';

import { FolderContainer } from './folder';


const store = createStore();

const Routes: React.SFC = () => (
  <Provider store={store}>
    <Router>
      <Switch>
        <Route path="/" exact component={FolderContainer} />
      </Switch>
    </Router>
  </Provider>
);

export default Routes;
