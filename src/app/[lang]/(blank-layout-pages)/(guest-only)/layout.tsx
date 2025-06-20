import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// HOC Imports
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'
import Header from '@/components/layout/front-pages/Header'
import { getServerMode } from '@/@core/utils/serverHelpers'
import { IntersectionProvider } from '@/contexts/intersectionContext'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: Locale }> }) => {
  const params = await props.params
  const mode = await getServerMode()
  const { children } = props

  return (
    <IntersectionProvider>
      <div className='flex flex-col min-h-screen'>
        <Header mode={mode} isMenuVisible={true} />
        <GuestOnlyRoute lang={params.lang}>{children}</GuestOnlyRoute>
      </div>
    </IntersectionProvider>
  )
}

export default Layout
