module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/apps/backend/main.js',
      interpreter: 'node',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: 'web',
      script: 'dist/apps/frontend/.next/standalone/server.js',
      interpreter: 'node',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: 'admin',
      script: 'deploy/serve-static.js',
      interpreter: 'node',
      cwd: '/app',
      args: ['dist/apps/admin'],
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
