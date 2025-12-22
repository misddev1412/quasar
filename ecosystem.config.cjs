module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/apps/api/server.js',
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
      script: 'dist/apps/web/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
    },
    {
      name: 'admin',
      script: 'dist/apps/admin/server.js',
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
