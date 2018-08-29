import React from 'react';
import { render } from 'react-dom';
import _ from 'lodash';

import { setupSentry } from '../common/sentry';

import App from './App';


if (process.env.NODE_ENV === 'production') {
  const Sentry = window.require('@sentry/electron');
  setupSentry(Sentry);
} else {
  const Immutable = require('immutable');
  const installDevTools = require('immutable-devtools');
  installDevTools(Immutable);
}

const element = document.getElementById('app');

const renderApp = (Component: any) => {
  render(<Component />, element);
};

renderApp(App);
