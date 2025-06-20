module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'ar', 'es'],
    localeDetection: true
  },
  defaultNS: 'global',
  localePath: './src/data/global-dictionaries',
  reloadOnPrerender: process.env.NODE_ENV === 'development'
}
