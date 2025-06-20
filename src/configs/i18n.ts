export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'fr', 'ar', 'es'],
  langDirection: {
    en: 'ltr',
    fr: 'ltr',
    ar: 'rtl',
    es: 'ltr'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
