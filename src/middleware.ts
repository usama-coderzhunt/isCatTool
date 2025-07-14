import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import type { Locale } from '@configs/i18n'
import { i18n } from '@configs/i18n'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/pages/auth/forgot-password',
  '/pages/auth/forgot-password/reset',
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/services',
  '/service-details',
  '/blogs',
  '/blog-details',
  '/apps/subscriptions'
]

const PROTECTED_PREFIXES = ['/dashboard', '/apps']

function isPublicRoute(pathname: string) {
  const withoutLang = pathname.replace(/^\/(en|fr|ar|es)/, '')

  return PUBLIC_ROUTES.some(route => withoutLang.startsWith(route))
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const localeInCookies = request.cookies.get('i18nextLng')?.value
    const lang = localeInCookies?.length && i18n.locales.includes(localeInCookies as Locale) ? localeInCookies : 'en'

    return NextResponse.redirect(new URL(`/${lang}`, request.url))
  }

  // Check if this is a payment callback
  const { pathname, origin } = request.nextUrl
  const localeMatch = pathname.match(/^\/(en|fr|ar|es)/)
  const locale = localeMatch ? localeMatch[0] : '/en'

  const token = request.cookies.get('accessToken')?.value
  const authRoutes = ['login', 'register', 'forgot-password', 'reset-password']

  const isAuthPage = authRoutes.includes(pathname.split('/').pop() || '')

  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.includes(prefix))

  // ✅ 1. Handle payment callback route

  if (request.nextUrl.pathname.startsWith('/payment-callback')) {
    const orderId = request.cookies.get('pendingOrderId')?.value

    if (orderId) {
      // Clear the cookie
      const response = NextResponse.redirect(new URL(`/en/dashboard/service-details/${orderId}`, request.url))

      response.cookies.delete('pendingOrderId')

      return response
    }
  }

  // ✅ 2. Redirect authenticated user away from login/register/forgot pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL(`${locale}/dashboard`, origin))
  }

  // ✅ 3. Redirect unauthenticated users from protected routes
  if (!token && isProtected && !isPublicRoute(pathname)) {
    const encodedRedirect = encodeURIComponent(pathname)

    return NextResponse.redirect(new URL(`${locale}/login?redirect=${encodedRedirect}`, origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static, API, and internal Next.js paths
    '/((?!_next|favicon.ico|api|static|.*\\..*).*)',
    '/payment-callback/:path*',
    '/'
  ]
}
