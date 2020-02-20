const path = require('path');

module.exports = {
  css: {
    sourceMap: true,
  },
  transpileDependencies: ['vuetify'],

  configureWebpack: {
    resolve: {
      alias: {
        '@common': path.resolve(__dirname, 'common/'),
        '@typings': path.resolve(__dirname, 'typings/'),
      },
    },
  },
};
