const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');

const ensureEnv = (key, value) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
};

// Force polling-based file watching to avoid EMFILE limits in restricted environments
ensureEnv('WATCHPACK_POLLING', 'true');
ensureEnv('CHOKIDAR_USEPOLLING', 'true');
ensureEnv('CHOKIDAR_INTERVAL', '1000');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  
  // Image optimization
  images: {
    domains: ['localhost', 'your-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // SEO-friendly trailing slashes
  trailingSlash: false,

  // Disable static page generation to avoid Html import issues
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },

  // Skip static generation for error pages
  skipTrailingSlashRedirect: true,

  // Custom webpack config
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
      '@components': path.join(__dirname, 'src/components'),
      '@pages': path.join(__dirname, 'src/pages'),
      '@utils': path.join(__dirname, 'src/utils'),
      '@contexts': path.join(__dirname, 'src/contexts'),
      '@hooks': path.join(__dirname, 'src/hooks'),
    };
    const repoRoot = path.join(__dirname, '..', '..');
    const toPosixGlob = (value) => value.replace(/\\/g, '/');
    const ignoredGlobs = [
      '**/node_modules/**',
      path.join(__dirname, '.next', '**'),
      path.join(__dirname, 'dist', '**'),
      path.join(__dirname, 'tmp', '**'),
      path.join(__dirname, 'prd', '**'),
      path.join(repoRoot, 'dist', '**'),
      path.join(repoRoot, 'tmp', '**'),
      path.join(repoRoot, 'prd', '**'),
      path.join(repoRoot, '.git', '**'),
    ].map(toPosixGlob);

    config.watchOptions = {
      ...config.watchOptions,
      poll: config.watchOptions?.poll ?? 1000,
      aggregateTimeout: config.watchOptions?.aggregateTimeout ?? 300,
      ignored: ignoredGlobs,
    };
    return config;
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.REACT_APP_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3000/api',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  },

  // Headers for SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Redirects if needed
  async redirects() {
    return [];
  },
};

module.exports = withNextIntl(nextConfig);
