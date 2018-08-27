import React from 'react';
import { render } from 'react-dom';
import _ from 'lodash';

import * as ipcMessages from '../common/ipcMessages';
import { setupSentry } from '../common/sentry';

import App from './App';

const Sentry = window.require('@sentry/electron');
const electron = window.require('electron');
const { ipcRenderer } = electron;

ipcRenderer.on(ipcMessages.open, console.log);

setupSentry(Sentry);

if (process.env.NODE_ENV !== 'production') {
  const Immutable = require('immutable');
  const installDevTools = require('immutable-devtools');
  installDevTools(Immutable);
}

const element = document.getElementById('app');

const renderApp = (Component: any) => {
  render(<Component />, element);
};

renderApp(App);
