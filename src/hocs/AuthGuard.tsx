'use client'

import { useEffect, useLayoutEffect, useState } from 'react'

import { useParams, usePathname, useRouter } from 'next/navigation'

import { useAuthStore } from '@/store/useAuthStore'

import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'
import { permissionMap, publicRoutes, type PermissionMap } from '@/utils/permissionUtils'
import { cipher, getDecryptedLocalStorage } from '@/utils/utility/decrypt'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { userPermissions, token, logout } = useAuthStore()
  const id = pathname.split('/').pop()
  const { id: id2 } = useParams()
  const pathnameWithoutId = pathname.split('/').slice(0, -1).join('/')
  const isPublicRoute = publicRoutes.includes(Number(id) ? pathnameWithoutId : pathname)
  useEffect(() => {
    if (
      !token &&
      !localStorage.getItem('returnUrl') &&
      !(
        pathname.includes('login') ||
        pathname.includes('register') ||
        pathname.includes('forgot-password') ||
        pathname.includes('reset-password')
      )
    ) {
      localStorage.setItem('returnUrl', cipher(window.location.pathname))
    }
    const redirectUrl = getDecryptedLocalStorage('returnUrl')

    if (!token && pathname.includes('/dashboard')) {
      router.push(`/${locale}/login`)
    }

    const checkAuthentication = () => {
      const isPublicRoute = (path: string): boolean => {
        const allRoutes = [...publicRoutes, ...Object.keys(permissionMap)]

        return allRoutes.some(route => {
          const pattern = '^' + route.replace(/:\w+/g, '[^/]+').replace(/\//g, '\\/') + '$'
          const regex = new RegExp(pattern)
          return regex.test(path)
        })
      }

      const currentPath = pathname
      const tokenExpiry = localStorage.getItem('tokenExpiry')

      if (
        token &&
        tokenExpiry &&
        (pathname.includes('login') ||
          pathname.includes('register') ||
          pathname.includes('forgot-password') ||
          pathname.includes('reset-password')) &&
        !redirectUrl
      ) {
        router.push(`/${locale}/dashboard`)

        return
      }

      if (!isPublicRoute(currentPath) && (!token || !tokenExpiry)) {
        setIsAuthenticated(false)
        localStorage.setItem('returnUrl', cipher(currentPath))
        router.replace(`/${locale}/login`)

        return
      }

      const expiryDate = tokenExpiry ? new Date(tokenExpiry) : new Date(0)
      const currentDate = new Date()

      if (!isPublicRoute(currentPath) && (isNaN(expiryDate.getTime()) || expiryDate <= currentDate)) {
        localStorage.clear()
        setIsAuthenticated(false)
        logout()
        localStorage.setItem('returnUrl', cipher(currentPath))
        router.replace(`/${locale}/login`)

        return
      }

      setIsAuthenticated(true)
    }

    checkAuthentication()

    const interval = setInterval(checkAuthentication, 30000)

    return () => clearInterval(interval)
  }, [router, token, pathname])

  useLayoutEffect(() => {
    const currentPath = pathname
    const isSuperUser = getDecryptedLocalStorage('isSuperUser')
    const userRole = getDecryptedLocalStorage('userRole')

    const isKnownRoute = (path: string): boolean => {
      const allRoutes = [...publicRoutes, ...Object.keys(permissionMap)]

      return allRoutes.some(route => {
        const pattern = '^' + route.replace(/:\w+/g, '[^/]+').replace(/\//g, '\\/') + '$'
        const regex = new RegExp(pattern)
        return regex.test(path)
      })
    }

    if (!isKnownRoute(currentPath)) {
      setIsAuthenticated(true)
      return
    }

    const requiredPermission = permissionMap[(id2 ? pathnameWithoutId : currentPath) as keyof PermissionMap]
    const hasPermission = userPermissions.some(permission => permission.codename === requiredPermission)

    if (!isSuperUser || userRole !== 'Admin') {
      if (publicRoutes.includes(currentPath)) {
        setIsAuthenticated(true)

        return
      }
      const returnUrl = getDecryptedLocalStorage('returnUrl')
      if (!isSuperUser && userRole !== 'Admin') {
        if (returnUrl && !token) {
          router.push(`/${locale}/login`)
          return
        } else if (returnUrl && token) {
          router.push(returnUrl)
          localStorage.removeItem('returnUrl')
          return
        } else if (requiredPermission && !hasPermission) {
          router.push(`/${locale}/dashboard`)
        }
      }
    }
  }, [userPermissions, router])

  if (isAuthenticated === null || (isAuthenticated === false && !isPublicRoute)) {
    return null
  }

  return <>{children}</>
}
