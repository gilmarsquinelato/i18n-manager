'use strict';

const fs = require('fs');
const paths = require('./paths');

function getModules() {
  // Check if TypeScript is setup
  const hasTsConfig = fs.existsSync(paths.appTsConfig);
  const hasJsConfig = fs.existsSync(paths.appJsConfig);

  if (hasTsConfig && hasJsConfig) {
    throw new Error(
      'You have both a tsconfig.json and a jsconfig.json. If you are using TypeScript please remove your jsconfig.json file.'
    );
  }

  return {
    additionalModulePaths: [paths.appSrc, paths.appCommon],
    hasTsConfig,
  };
}

module.exports = getModules();
