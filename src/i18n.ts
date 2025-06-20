'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enTranslations from '@/data/global-dictionaries/en.json'
import frTranslations from '@/data/global-dictionaries/fr.json'
import esTranslations from '@/data/global-dictionaries/es.json'
import arTranslations from '@/data/global-dictionaries/ar.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { global: enTranslations },
      fr: { global: frTranslations },
      ar: { global: arTranslations },
      es: { global: esTranslations }
    },
    lng: 'en',
    fallbackLng: 'en',
    ns: ['global'],
    defaultNS: 'global',
    interpolation: { escapeValue: false },
    detection: {
      order: ['path'],
      lookupFromPathIndex: 0
    }
  })

export default i18n
