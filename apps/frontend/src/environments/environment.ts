export const environment = {
  production: false,
  apiUrl: process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
};
