import { getDecryptedLocalStorage } from './utility/decrypt'

// Utility function to check multiple permissions
export const hasPermissions = (userPermissions: Array<{ codename: string }>, requiredCodenames: string[]): boolean => {
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')
  if (requiredCodenames.includes('isSuperUser') || requiredCodenames.includes('Admin')) {
    return isSuperUser || userRole === 'Admin'
  }
  if (isSuperUser) {
    return true
  } else if (userRole === 'Admin') {
    return true
  } else {
    return requiredCodenames?.every(codename => userPermissions?.some(permission => permission.codename === codename))
  }
}

export type PermissionMap = {
  [key in
    | `/en/apps/clients`
    | `/fr/apps/clients`
    | `/ar/apps/clients`
    | `/en/dashboards/service`
    | `/fr/dashboards/service`
    | `/ar/dashboards/service`
    | `/en/apps/leads`
    | `/fr/apps/leads`
    | `/ar/apps/leads`
    | `/en/apps/users`
    | `/fr/apps/users`
    | `/ar/apps/users`
    | `/en/apps/positions`
    | `/fr/apps/positions`
    | `/ar/apps/positions`
    | `/en/apps/staff`
    | `/fr/apps/staff`
    | `/ar/apps/staff`
    | `/en/apps/groups`
    | `/fr/apps/groups`
    | `/ar/apps/groups`
    | `/en/apps/services`
    | `/fr/apps/services`
    | `/ar/apps/services`
    | `/en/apps/lawyer-clients`
    | `/fr/apps/lawyer-clients`
    | `/ar/apps/lawyer-clients`
    | `/en/apps/lawyer-leads`
    | `/fr/apps/lawyer-leads`
    | `/ar/apps/lawyer-leads`
    | `/en/apps/cases`
    | `/fr/apps/cases`
    | `/ar/apps/cases`
    | `/en/apps/docs-type`
    | `/fr/apps/docs-type`
    | `/ar/apps/docs-type`
    | `/en/apps/notifications`
    | `/fr/apps/notifications`
    | `/ar/apps/notifications`
    | `/en/apps/coupons`
    | `/fr/apps/coupons`
    | `/ar/apps/coupons`
    | `/en/apps/orders`
    | `/fr/apps/orders`
    | `/ar/apps/orders`
    | `/en/apps/subscriptions`
    | `/fr/apps/subscriptions`
    | `/ar/apps/subscriptions`
    | `/en/apps/transactions`
    | `/fr/apps/transactions`
    | `/ar/apps/transactions`
    | `/en/apps/case-types`
    | `/fr/apps/case-types`
    | `/ar/apps/case-types`]: string
}

export const publicRoutes = [
  '/',
  '/home',

  '/en/login',
  '/en/pages/auth/forgot-password-v1',
  '/en/register',
  '/en/home',
  '/en/about',
  '/en/contact',
  '/en/privacy-policy',
  '/en/TermsofService',
  '/en/services',
  '/en/service-details/:id',
  '/en/blogs',
  '/en/blog-details/:slug',
  '/en/dashboards/service/:id',
  '/en/service-details',

  '/en/apps/services',
  '/en/apps/services/:id',
  '/fr/apps/services',

  '/fr/apps/services/:id',
  '/ar/apps/services',
  '/en/apps/services/:id',

  '/en/dashboards/service',
  '/fr/dashboards/service',
  '/ar/dashboards/service',

  '/fr/login',
  '/fr/pages/auth/forgot-password-v1',
  '/fr/register',
  '/fr/home',
  '/fr/about',
  '/fr/contact',
  '/fr/privacy-policy',
  '/fr/TermsofService',
  '/fr/services',
  '/fr/service-details/:id',
  '/fr/blogs',
  '/fr/blog-details/:slug',
  '/fr/dashboards/service/:id',
  '/fr/service-details',

  '/en/apps/services',
  '/fr/apps/services',
  '/ar/apps/services',

  '/ar/login',
  '/ar/pages/auth/forgot-password-v1',
  '/ar/register',
  '/ar/home',
  '/ar/about',
  '/ar/contact',
  '/ar/privacy-policy',
  '/ar/TermsofService',
  '/ar/services',
  '/ar/service-details/:id',
  '/ar/blogs',
  '/ar/blog-details/:slug',
  '/ar/dashboards/service/:id',
  '/ar/service-details'
]

export const permissionMap: PermissionMap = {
  '/en/apps/clients': 'view_transclient',
  '/fr/apps/clients': 'view_transclient',
  '/ar/apps/clients': 'view_transclient',

  '/en/apps/leads': 'view_transclient',
  '/fr/apps/leads': 'view_transclient',
  '/ar/apps/leads': 'view_transclient',

  '/en/apps/users': 'view_staff',
  '/fr/apps/users': 'view_staff',
  '/ar/apps/users': 'view_staff',

  '/en/apps/positions': 'view_staffposition',
  '/fr/apps/positions': 'view_staffposition',
  '/ar/apps/positions': 'view_staffposition',

  '/en/apps/staff': 'view_staff',
  '/fr/apps/staff': 'view_staff',
  '/ar/apps/staff': 'view_staff',

  '/en/apps/groups': 'view_group',
  '/fr/apps/groups': 'view_group',
  '/ar/apps/groups': 'view_group',

  '/en/apps/lawyer-clients': 'view_lawyerclient',
  '/fr/apps/lawyer-clients': 'view_lawyerclient',
  '/ar/apps/lawyer-clients': 'view_lawyerclient',

  '/en/apps/lawyer-leads': 'view_lawyerclient',
  '/fr/apps/lawyer-leads': 'view_lawyerclient',
  '/ar/apps/lawyer-leads': 'view_lawyerclient',

  '/en/apps/cases': 'view_case',
  '/fr/apps/cases': 'view_case',
  '/ar/apps/cases': 'view_case',

  '/en/apps/docs-type': 'view_documenttype',
  '/fr/apps/docs-type': 'view_documenttype',
  '/ar/apps/docs-type': 'view_documenttype',

  '/en/apps/notifications': 'view_notification',
  '/fr/apps/notifications': 'view_notification',
  '/ar/apps/notifications': 'view_notification',

  '/en/apps/coupons': 'view_coupon',
  '/fr/apps/coupons': 'view_coupon',
  '/ar/apps/coupons': 'view_coupon',

  '/en/apps/orders': 'view_order',
  '/fr/apps/orders': 'view_order',
  '/ar/apps/orders': 'view_order',

  '/en/apps/subscriptions': 'view_subscription',
  '/fr/apps/subscriptions': 'view_subscription',
  '/ar/apps/subscriptions': 'view_subscription',

  '/en/apps/transactions': 'view_transaction',
  '/fr/apps/transactions': 'view_transaction',
  '/ar/apps/transactions': 'view_transaction',

  '/en/apps/case-types': 'view_casetype',
  '/fr/apps/case-types': 'view_casetype',
  '/ar/apps/case-types': 'view_casetype',

  '/en/apps/services': '',
  '/fr/apps/services': '',
  '/ar/apps/services': '',

  '/en/dashboards/service': '',
  '/fr/dashboards/service': '',
  '/ar/dashboards/service': ''
}
