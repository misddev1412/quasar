const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

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
      generatePackageJson: true,
    }),
  ],
  // Enable hot reload for development
  watchOptions: {
    ignored: /node_modules/,
    poll: 1000,
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
};
