import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Check if this is a payment callback
    if (request.nextUrl.pathname.startsWith('/payment-callback')) {
        const orderId = request.cookies.get('pendingOrderId')?.value
        if (orderId) {
            // Clear the cookie
            const response = NextResponse.redirect(new URL(`/en/dashboards/service-details/${orderId}`, request.url))
            response.cookies.delete('pendingOrderId')
            return response
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/payment-callback/:path*'
} 
