const path = require('path');

module.exports = {
  outputDir: path.resolve(__dirname, 'build/view'),
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
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
