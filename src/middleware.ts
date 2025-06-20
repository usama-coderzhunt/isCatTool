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
import { publicRoutes } from './utils/permissionUtils' // adjust path as needed

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // 1. Handle payment callback route
  if (pathname.startsWith('/payment-callback')) {
    const orderId = request.cookies.get('pendingOrderId')?.value

    if (orderId) {
      const response = NextResponse.redirect(new URL(`/en/dashboard/service-details/${orderId}`, request.url))
      response.cookies.delete('pendingOrderId')
      return response
    }

    return NextResponse.next()
  }

  // 2. Check if route is public
  const isPublicRoute = publicRoutes.some(route => {
    const regexPattern = '^' + route.replace(/:\w+/g, '[^/]+').replace(/\//g, '\\/') + '$'
    return new RegExp(regexPattern).test(pathname)
  })

  // 3. Redirect if protected and not authenticated
  if (!token && !isPublicRoute) {
    const locale = pathname.split('/')[1] || 'en'
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('returnUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// ✅ Required config block to enable middleware
export const config = {
  matcher: ['/((?!_next|static|favicon.ico|api).*)']
}
