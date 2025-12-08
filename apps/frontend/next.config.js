const createNextIntlPlugin = require('next-intl/plugin');

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
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@utils': '/src/utils',
      '@contexts': '/src/contexts',
      '@hooks': '/src/hooks',
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
