// MUI Imports
import Button from '@mui/material/Button'
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'
import { i18n } from '@configs/i18n'
// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'
import type { Locale } from '@configs/i18n'
// Type Imports
import type { ChildrenType } from '@core/types'

// Context Imports
import { IntersectionProvider } from '@/contexts/intersectionContext'

// Component Imports
import Providers from '@components/Providers'
import BlankLayout from '@layouts/BlankLayout'
import FrontLayout from '@components/layout/front-pages'
import ScrollToTop from '@core/components/scroll-to-top'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'

// Style Imports
import '@/app/globals.css'
import { TitleUpdater } from '@/components/TitleUpdater'
import SetLanguageCookie from '@/components/SetLanguageCookie'

// Generated Icon CSS Imports
// import '@assets/iconify-icons/generated-icons.css'

const Layout = async ({ children, params }: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  // Vars
  const systemMode = await getSystemMode()
  const resolvedParams = await params
  const direction = i18n.langDirection[resolvedParams.lang]

  return (
    <>
      <SetLanguageCookie lang={resolvedParams.lang} />
      <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
      <Providers direction={direction}>
        <BlankLayout systemMode={systemMode}>
          <IntersectionProvider>
            <FrontLayout>
              <TitleUpdater />
              {children}
              <ScrollToTop className='mui-fixed'>
                <Button
                  variant='contained'
                  className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
                >
                  <i className='tabler-arrow-up' />
                </Button>
              </ScrollToTop>
            </FrontLayout>
          </IntersectionProvider>
        </BlankLayout>
      </Providers>
    </>
  )
}

export default Layout
