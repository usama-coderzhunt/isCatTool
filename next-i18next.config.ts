module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'ar'],
    localeDetection: true
  },
  defaultNS: 'global',
  localePath: './src/data/global-dictionaries',
  reloadOnPrerender: process.env.NODE_ENV === 'development'
} 
