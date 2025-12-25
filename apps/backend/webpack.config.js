const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

// Only externalize native modules that need to be resolved at runtime
const nativeModules = [
  'bcrypt',
  'pg',
  'pg-native',
  'sqlite3',
  '@aws-sdk/client-s3',
  '@aws-sdk/s3-request-presigner',
  'amqplib',
];

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/backend'),
  },
  // Force emitting sourcemaps even in production for nestjs-trpc scanners
  devtool: 'source-map',
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      sourceMap: true,
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: false, // Use root package.json
    }),
  ],
  // Only externalize native modules - bundle everything else
  externals: [
    (data, callback) => {
      if (nativeModules.some(mod => data.request?.startsWith(mod))) {
        return callback(null, `commonjs ${data.request}`);
      }
      callback();
    },
  ],
  // Enable hot reload for development
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};
