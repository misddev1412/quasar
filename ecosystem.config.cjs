module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/apps/backend/main.js',
      interpreter: 'node',
      cwd: '/app',
      env: {
        NODE_ENV: 'production',
        BACKEND_PORT: process.env.BACKEND_PORT || '3000',
        PORT: process.env.BACKEND_PORT || '3000',
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
        PORT: process.env.FRONTEND_PORT || '3001',
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
      env: {
        NODE_ENV: 'production',
        ADMIN_PORT: process.env.ADMIN_PORT || '4000',
        PORT: process.env.ADMIN_PORT || '4000',
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};
