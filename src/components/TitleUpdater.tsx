// components/TitleUpdater.tsx
'use client'
import { useEffect } from 'react'

import { useParams, usePathname } from 'next/navigation'

import { useTranslation } from 'react-i18next'

import { useAdminSettingsHook } from '@/services/adminSettingsHook'

export const TitleUpdater = () => {
  const pathname = usePathname()
  const { t } = useTranslation('global')
  const { useGeneralSettings } = useAdminSettingsHook()
  const { data: generalSettings } = useGeneralSettings()
  const { lang } = useParams()
  const { id } = useParams()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = pathname.split('/').filter(Boolean)
      const pageName = id ? pathParts[pathParts.length - 2] : pathParts[pathParts.length - 1] || 'home'

      const translatedPageName = t(`page_titles.${pageName}`, { defaultValue: pageName })

      const mainTitle =
        generalSettings?.main_title[lang as keyof typeof generalSettings.main_title] ||
        generalSettings?.main_title.en ||
        ''

      document.title = mainTitle ? `${translatedPageName} - ${mainTitle}` : translatedPageName
    }
  }, [pathname, generalSettings, lang, t])

  return null
}
