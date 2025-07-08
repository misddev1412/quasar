const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi', 'en'],
    localeDetection: true,
  },
  localePath: path.resolve('./public/locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  fallbackLng: 'vi',
  debug: process.env.NODE_ENV === 'development',
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  },
  ns: ['common'],
  defaultNS: 'common',
}; 