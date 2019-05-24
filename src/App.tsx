import React from 'react';
import { hot } from 'react-hot-loader/root';
import { StoreProvider } from 'easy-peasy';
import { Router } from '@reach/router';

import { store } from './store';
import { Home } from './home';
import { Folder } from './folder';


const App: React.FC = () => {
  return (
    <>
      <StoreProvider store={store}>
        <Router>
          <Home path="/"/>
          <Folder path="/folder"/>
        </Router>
      </StoreProvider>
    </>
  );
};

export default hot(App);
