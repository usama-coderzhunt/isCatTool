// Next Imports
import { headers } from 'next/headers'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'
import AuthGuard from '@/hocs/AuthGuard'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'
import '@assets/iconify-icons/generated-icons.css'
import { TitleUpdater } from '@/components/TitleUpdater'
import MetaDataUpdater from '@/components/MetaUpdater'

// Define the metadata generation function
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

export async function generateMetadata() {
  const [iconRes, seoRes] = await Promise.all([
    fetch(`${baseUrl}/api/dashboard/logo/`),
    fetch(`${baseUrl}/api/dashboard/seo/`)
  ])

  const [iconData, seoData] = await Promise.all([iconRes.json(), seoRes.json()])

  const seoSettings = seoData?.results[0]

  return {
    description: seoSettings?.meta_description,
    keywords: seoSettings?.seo_keywords,
    icons: {
      icon: iconData?.results[0]?.favicon
    },
    other: {
      title: seoSettings?.title,
      tagline: seoSettings?.tagline
    }
  }
}

const RootLayout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params

  // Vars
  const headersList = await headers()
  const systemMode = await getSystemMode()
  const direction = i18n.langDirection[params.lang]

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction} suppressHydrationWarning>
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
          <TitleUpdater />
          <MetaDataUpdater />
          <AuthGuard locale={params.lang}>{props.children}</AuthGuard>
        </body>
      </html>
    </TranslationWrapper>
  )
}

export default RootLayout
