import { navigate, Router } from '@reach/router';
import React, { useEffect } from 'react';
import { hot } from 'react-hot-loader/root';
import { Provider } from 'react-redux';

import createStore from './store';

import { Folder } from './folder';
import { Home } from './home';
import { Settings } from './settings';


const store = createStore();

const App: React.FC = () => {
  // useEffect(() => {
  //   navigate('/');
  // }, []);

  return (
    <>
      <Provider store={store}>
        <Router>
          <Home path="/"/>
          <Folder path="/folder"/>
          <Settings path="/settings"/>
        </Router>
      </Provider>
    </>
  );
};

export default hot(App);
