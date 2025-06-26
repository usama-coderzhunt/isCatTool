// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export function middleware(request: NextRequest) {
//   // Check if this is a payment callback
//   if (request.nextUrl.pathname.startsWith('/payment-callback')) {
//     const orderId = request.cookies.get('pendingOrderId')?.value
//     if (orderId) {
//       // Clear the cookie
//       const response = NextResponse.redirect(new URL(`/en/dashboard/service-details/${orderId}`, request.url))
//       response.cookies.delete('pendingOrderId')
//       return response
//     }
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: '/payment-callback/:path*'
// }

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/pages/auth/forgot-password',
  '/pages/auth/forgot-password/reset',
  '/home',
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
  const { pathname, origin } = request.nextUrl
  const localeMatch = pathname.match(/^\/(en|fr|ar|es)/)
  const locale = localeMatch ? localeMatch[0] : '/en'

  const token = request.cookies.get('accessToken')?.value

  const isAuthPage =
    pathname.endsWith('/login') ||
    pathname.endsWith('/register') ||
    pathname.includes('forgot-password') ||
    pathname.includes('reset-password')

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
    '/((?!_next|favicon.ico|api|static|.*\\..*).*)'
  ]
}
