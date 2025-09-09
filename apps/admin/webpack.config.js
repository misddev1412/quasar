const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/admin'),
  },
  resolve: {
    alias: {
      '@admin': join(__dirname, 'src'),
    },
  },

  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',

      styles: ['./src/styles.scss'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      // svgr: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: join(__dirname, 'public/tinymce'),
          to: 'tinymce',
          globOptions: {
            ignore: ['**/.*'],
          },
        },
      ],
    }),
  ],

  devServer: {
    static: [
      {
        directory: join(__dirname, 'public'),
        publicPath: '/',
        staticOptions: {
          setHeaders: (res, path) => {
            if (path.endsWith('.js')) {
              res.set('Content-Type', 'application/javascript');
            }
          },
        },
      },
    ],
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    proxy: [
      {
        context: ['/uploads'],
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    ],
  },
};
