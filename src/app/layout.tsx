'use client'

import '@/i18n'
import { I18nProvider } from '@/providers/I18nProvider'
import { useEffect, useLayoutEffect, useState } from 'react'
import { useAdminSettingsHook } from '@/services/adminSettingsHook'
import { useTemplateStore } from '@/store/templateStore'
import { useSettings } from '@/@core/hooks/useSettings'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsProvider } from '@/@core/contexts/settingsContext'
import themeConfig from '@configs/themeConfig'
import Script from 'next/script'
import { useParams, usePathname } from 'next/navigation'
import { GoogleAnalytics } from '@next/third-parties/google'

// Create a client
const queryClient = new QueryClient()

interface MainTitle {
  [key: string]: string
}

const AdminSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams()

  const { useLogoSettings, useGeneralSettings } = useAdminSettingsHook()
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

  useLayoutEffect(() => {
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
    setTemplateName((generalSettings?.main_title as MainTitle)?.[lang as string] || '')
  }, [generalSettings, lang])

  return children
}

const TrackingScripts = () => {
  const { useSocialTrackingSettings } = useAdminSettingsHook()
  const { data: trackingSettings } = useSocialTrackingSettings()
  const [gaToken, setGaToken] = useState('')
  const [fbToken, setFbToken] = useState('')
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (trackingSettings) {
      setGaToken(trackingSettings.google_analytics_code || '')
      setFbToken(trackingSettings.facebook_pixel_code || '')
    }
  }, [trackingSettings])

  useEffect(() => {
    if (gaToken && typeof window.gtag === 'function') {
      window.gtag('config', gaToken, { page_path: pathname })
    }

    if (fbToken && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView')
    }
  }, [pathname, gaToken, fbToken])
  useEffect(() => {
    if (!fbToken) return

    if (!window.fbq) {
      // Define fbq before loading script
      const fbq: any = function () {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments)
      }
      fbq.push = fbq
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = []
      window.fbq = fbq
    }

    // Prevent duplicate script injection
    if (!document.getElementById('facebook-pixel-script')) {
      const script = document.createElement('script')
      script.async = true
      script.src = 'https://connect.facebook.net/en_US/fbevents.js'
      script.id = 'facebook-pixel-script'
      document.head.appendChild(script)
    }

    window.fbq('init', fbToken)
    window.fbq('track', 'PageView')

    return () => {
      // Optional: remove pixel script if needed
      const existing = document.getElementById('facebook-pixel-script')
      if (existing && existing.parentNode) {
        existing.parentNode.removeChild(existing)
      }
    }
  }, [fbToken])

  return <>{gaToken && <GoogleAnalytics gaId={gaToken} />}</>
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider
            settingsCookie={themeConfig.settingsCookieName}
            defaultSettings={{
              mode: themeConfig.mode,
              skin: themeConfig.skin,
              layout: themeConfig.layout,
              contentWidth: themeConfig.contentWidth,
              navbar: themeConfig.navbar,
              footer: themeConfig.footer
            }}
          >
            <I18nProvider>
              <AdminSettingsProvider>
                <TrackingScripts />
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
