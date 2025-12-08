export const environment = {
  production: true,
  apiUrl: process.env.REACT_APP_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.yourapp.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourapp.com',
};
