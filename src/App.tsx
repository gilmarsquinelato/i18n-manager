import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';
import { Route, Router } from 'react-router-dom';

import hashHistory from './historyProvider';
import createStore from './store';

import { Folder } from './folder';
import { Home } from './home';
import { Settings } from './settings';


const store = createStore();

const App: React.FC = () => {
  return (
    <>
      <Provider store={store}>
        <Router history={hashHistory}>
          <Route path="/" exact component={Home}/>
          <Route path="/folder" component={Folder}/>
          <Route path="/settings" component={Settings}/>
        </Router>
      </Provider>
    </>
  );
};

export default hot(App);
