'use client'

import '@/i18n'
import { I18nProvider } from '@/providers/I18nProvider'
import { useEffect } from 'react'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTemplateStore } from '@/store/templateStore'
import { useSettings } from '@/@core/hooks/useSettings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsProvider } from '@/@core/contexts/settingsContext'
import themeConfig from '@configs/themeConfig'

// Create a client
const queryClient = new QueryClient()

const AdminSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { 
    useLogoSettings,
    useGeneralSettings
  } = useAdminSettingsHook()

  const { data: logoSettings } = useLogoSettings()
  const { data: generalSettings } = useGeneralSettings()
  const { settings } = useSettings()
  const { setTemplateName, setTemplateLogo } = useTemplateStore()

  const getLogoTypeByMode = (mode: string) => {
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? 'dark_logo' : 'light_logo'
    }
    return mode === 'dark' ? 'dark_logo' : 'light_logo'
  }

  useEffect(() => {
    if (logoSettings) {
      const logoMap: Record<string, string> = {
        light_logo: logoSettings.light_logo,
        dark_logo: logoSettings.dark_logo,
        favicon: logoSettings.favicon
      }
      const logoType = getLogoTypeByMode(settings?.mode || 'light')
      setTemplateLogo(logoMap[logoType] || '')
    }
  }, [logoSettings, settings?.mode])

  useEffect(() => {
    if (generalSettings?.main_title) {
      setTemplateName(generalSettings.main_title)
    }
  }, [generalSettings])

  return children
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider settingsCookie={themeConfig.settingsCookieName} defaultSettings={{
            mode: themeConfig.mode,
            skin: themeConfig.skin,
            layout: themeConfig.layout,
            contentWidth: themeConfig.contentWidth,
            navbar: themeConfig.navbar,
            footer: themeConfig.footer
          }}>
            <I18nProvider>
              <AdminSettingsProvider>
                {children}
              </AdminSettingsProvider>
            </I18nProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}

export default RootLayout 
