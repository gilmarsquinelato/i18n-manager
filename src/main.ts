import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import 'jquery';
import 'popper.js';
import 'bootstrap';

import { AppModule } from '@app/app.module';
import { environment } from '@env/environment';
import { sentryConfig } from '@common/sentry';


const disablePinchGesture = () => {
  const webFrame = window.require('electron').webFrame;
  webFrame.setVisualZoomLevelLimits(1, 1);
  webFrame.setLayoutZoomLevelLimits(0, 0);
};

const enableSentry = () => {
  if (window.require) {
    window.require('@sentry/electron').init(sentryConfig);
  }
};

if (environment.production) {
  enableProdMode();
  enableSentry();
  disablePinchGesture();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

