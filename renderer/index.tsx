import React from 'react';
import { render } from 'react-dom';
import _ from 'lodash';

import { sentryConfig } from '../common/sentry';

import App from './App';


const disablePinchGesture = () => {
  const webFrame = window.require('electron').webFrame;
  webFrame.setVisualZoomLevelLimits(1, 1);
  webFrame.setLayoutZoomLevelLimits(0, 0);
};

const enableSentry = () => {
  if (process.env.NODE_ENV === 'production' && window.require) {
    window.require('@sentry/electron').init(sentryConfig);
  }
};

const installImmutableFormatter = () => {
  if (process.env.NODE_ENV === 'development') {
    const Immutable = require('immutable');
    const installDevTools = require('immutable-devtools');
    installDevTools(Immutable);
  }
};


const element = document.getElementById('app');

const renderApp = (Component: any) => {
  render(<Component />, element);
};


enableSentry();
disablePinchGesture();
installImmutableFormatter();

renderApp(App);
