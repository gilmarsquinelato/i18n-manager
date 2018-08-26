import React from 'react';
import { render } from 'react-dom';
import { injectGlobal } from 'emotion';

import * as ipcMessages from '../common/ipcMessages';

import App from './components/App';


const Sentry = window.require('@sentry/electron');
const electron = window.require('electron');
const { ipcRenderer } = electron;

ipcRenderer.on(ipcMessages.open, console.log);


Sentry.init({
  dsn: 'https://f55d7c8072cd44d7897d43c9b5294d3d@sentry.io/1268922',
});


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
