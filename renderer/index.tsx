import React from 'react';
import { render } from 'react-dom';
import { injectGlobal } from 'emotion';

import * as ipcMessages from '../common/ipcMessages';

import App from './components/App';

const electron = window.require('electron');
const { ipcRenderer } = electron;

ipcRenderer.on(ipcMessages.open, console.log);


injectGlobal`
  html, body {
    position: relative;
    display: flex;
    width: 100%;
    height: 100%;
  }

  #app {
    width: 100%;
    height: 100%;
  }
`;


const element = document.getElementById('app');

const renderApp = (Component: any) => {
  render(<Component />, element);
};

renderApp(App);
