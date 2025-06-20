'use client'

// Next Imports
import { redirect, usePathname, useSearchParams } from 'next/navigation'

// Config Imports
import { i18n } from '@configs/i18n'

const LangRedirect = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const queryString = searchParams?.toString()
  const redirectUrl = `/${i18n.defaultLocale}${pathname}${queryString ? `?${queryString}` : ''}`

  redirect(redirectUrl)
}

export default LangRedirect
