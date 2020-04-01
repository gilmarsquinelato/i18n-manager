const path = require('path');

module.exports = {
  css: {
    sourceMap: process.env.NODE_ENV !== 'production',
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
