'use client'

import { useEffect, useLayoutEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'

import type { Locale } from '@configs/i18n'
import type { ChildrenType } from '@core/types'
import { permissionMap, publicRoutes, type PermissionMap } from '@/utils/permissionUtils'
import { getDecryptedLocalStorage } from '@/utils/utility/decrypt'

export default function AuthGuard({ children, locale }: ChildrenType & { locale: Locale }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { userPermissions, token } = useAuthStore()
  const id = pathname.split('/').pop()
  const pathnameWithoutId = pathname.split('/').slice(0, -1).join('/')

  const isPublicRoute = publicRoutes.includes(Number(id) ? pathnameWithoutId : pathname)
  useEffect(() => {
    const checkAuthentication = () => {
      const isPublicRoute = (path: string): boolean => {
        return publicRoutes.some(route => {
          const routeWithId = route.replace(':id', id || '')
          const pattern = '^' + routeWithId.replace(/:slug/g, '[^/]+').replace(/\//g, '\\/') + '$'

          const regex = new RegExp(pattern)
          return regex.test(path)
        })
      }

      const currentPath = window.location.pathname
      const tokenExpiry = localStorage.getItem('tokenExpiry')

      if (!isPublicRoute(currentPath) && (!token || !tokenExpiry)) {
        setIsAuthenticated(false)
        router.replace(`/${locale}/login`)
        return
      }

      const expiryDate = tokenExpiry ? new Date(tokenExpiry) : new Date(0)
      const currentDate = new Date()

      if (!isPublicRoute(currentPath) && (isNaN(expiryDate.getTime()) || expiryDate <= currentDate)) {
        localStorage.clear()
        setIsAuthenticated(false)
        router.replace(`/${locale}/login`)
        return
      }

      setIsAuthenticated(true)
    }

    checkAuthentication()

    const interval = setInterval(checkAuthentication, 30000) // checking every 30 seconds
    return () => clearInterval(interval)
  }, [router])

  useLayoutEffect(() => {
    const currentPath = window.location.pathname
    const isSuperUser = getDecryptedLocalStorage('isSuperUser')
    const userRole = getDecryptedLocalStorage('userRole')
    if (!isSuperUser || userRole !== 'Admin') {
      if (publicRoutes.includes(currentPath)) {
        setIsAuthenticated(true)
        return
      }

      const requiredPermission = permissionMap[currentPath as keyof PermissionMap]

      const hasPermission = userPermissions.some(permission => permission.codename === requiredPermission)

      if (!isSuperUser && userRole !== 'Admin') {
        if (requiredPermission && !hasPermission) {
          router.push('/dashboards/crm')
        }
      }
    }
  }, [userPermissions, router])

  if (isAuthenticated === null || (isAuthenticated === false && !isPublicRoute)) {
    return null
  }

  return <>{children}</>
}
