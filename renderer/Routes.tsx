import * as React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

import { FolderContainer } from './folder';

const Routes: React.SFC = () => (
  <Router>
    <Switch>
      <Route path="/" exact component={FolderContainer} />
    </Switch>
  </Router>
);

export default Routes;
