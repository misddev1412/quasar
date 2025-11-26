const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/admin'),
  },
  resolve: {
    alias: {
      '@admin': join(__dirname, 'src'),
      // Redirect NestJS imports to empty stubs (backend-only modules)
      '@nestjs/common': join(__dirname, 'src/stubs/@nestjs/common.ts'),
      '@nestjs/swagger': join(__dirname, 'src/stubs/@nestjs/swagger.ts'),
      '@nestjs/core': join(__dirname, 'src/stubs/@nestjs/core.ts'),
      '@nestjs/websockets': join(__dirname, 'src/stubs/@nestjs/core.ts'),
      '@nestjs/microservices': join(__dirname, 'src/stubs/@nestjs/core.ts'),
      'class-transformer/storage': join(__dirname, 'src/stubs/class-transformer-storage.ts'),
    },
    fallback: {
      'fs': false,
      'net': false,
      'tls': false,
      'crypto': false,
      'stream': false,
      'url': false,
      'zlib': false,
      'http': false,
      'https': false,
      'assert': false,
      'os': false,
      'path': false,
      'util': false,
      'buffer': false,
      'process': false,
      'events': false,
      'perf_hooks': false,
      'async_hooks': false,
      'repl': false,
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: /node_modules/,
      },
    ],
  },
  externals: (context, request, callback) => {
    // Externalize Node.js core modules
    if (/^node:/.test(request)) {
      return callback(null, 'commonjs ' + request);
    }
    callback();
  },
  ignoreWarnings: [
    {
      module: /node_modules/,
    },
    /Failed to parse source map/,
    /node:/,
  ],

  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^node:/,
    }),
    new NodePolyfillPlugin(),
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
