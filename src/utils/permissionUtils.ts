import { getDecryptedLocalStorage } from './utility/decrypt'

// Utility function to check multiple permissions
export const hasPermissions = (userPermissions: Array<{ codename: string }>, requiredCodenames: string[]): boolean => {
  const isSuperUser = getDecryptedLocalStorage('isSuperUser')
  const userRole = getDecryptedLocalStorage('userRole')

  if (requiredCodenames.includes('adminAndSuperUserOnly')) {
    return isSuperUser || userRole === 'Admin'
  }

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
    | `/es/apps/clients`
    | `/en/dashboard/service`
    | `/fr/dashboard/service`
    | `/ar/dashboard/service`
    | `/es/dashboard/service`
    | `/en/apps/leads`
    | `/fr/apps/leads`
    | `/ar/apps/leads`
    | `/es/apps/leads`
    | `/en/apps/users`
    | `/fr/apps/users`
    | `/ar/apps/users`
    | `/es/apps/users`
    | `/en/apps/positions`
    | `/fr/apps/positions`
    | `/ar/apps/positions`
    | `/es/apps/positions`
    | `/en/apps/staff`
    | `/fr/apps/staff`
    | `/ar/apps/staff`
    | `/es/apps/staff`
    | `/en/apps/groups`
    | `/fr/apps/groups`
    | `/ar/apps/groups`
    | `/es/apps/groups`
    | `/en/apps/services`
    | `/fr/apps/services`
    | `/ar/apps/services`
    | `/es/apps/services`
    | `/en/apps/service-categories`
    | `/fr/apps/service-categories`
    | `/ar/apps/service-categories`
    | `/es/apps/service-categories`
    | `/en/apps/lawyer-clients`
    | `/fr/apps/lawyer-clients`
    | `/ar/apps/lawyer-clients`
    | `/es/apps/lawyer-clients`
    | `/en/apps/lawyer-leads`
    | `/fr/apps/lawyer-leads`
    | `/ar/apps/lawyer-leads`
    | `/es/apps/lawyer-leads`
    | `/en/apps/cases`
    | `/fr/apps/cases`
    | `/ar/apps/cases`
    | `/es/apps/cases`
    | `/en/apps/docs-type`
    | `/fr/apps/docs-type`
    | `/ar/apps/docs-type`
    | `/es/apps/docs-type`
    | `/en/apps/notifications`
    | `/fr/apps/notifications`
    | `/ar/apps/notifications`
    | `/es/apps/notifications`
    | `/en/apps/coupons`
    | `/fr/apps/coupons`
    | `/ar/apps/coupons`
    | `/es/apps/coupons`
    | `/en/apps/orders`
    | `/fr/apps/orders`
    | `/ar/apps/orders`
    | `/es/apps/orders`
    | `/en/apps/transactions`
    | `/fr/apps/transactions`
    | `/ar/apps/transactions`
    | `/es/apps/transactions`
    | `/en/apps/case-types`
    | `/fr/apps/case-types`
    | `/ar/apps/case-types`
    | `/es/apps/case-types`
    | `/en/apps/services/:id`
    | `/fr/apps/services/:id`
    | `/ar/apps/services/:id`
    | `/es/apps/services/:id`
    | `/en/apps/services`
    | `/fr/apps/services`
    | `/ar/apps/services`
    | `/es/apps/services`
    | `/en/dashboard/service`
    | `/fr/dashboard/service`
    | `/ar/dashboard/service`
    | `/es/dashboard/service`
    | `/en/dashboard/service/:id`
    | `/fr/dashboard/service/:id`
    | `/ar/dashboard/service/:id`
    | `/es/dashboard/service/:id`
    | `/en/apps/invoices`
    | `/fr/apps/invoices`
    | `/ar/apps/invoices`
    | `/es/apps/invoices`
    | `/en/apps/refunds`
    | `/fr/apps/refunds`
    | `/ar/apps/refunds`
    | `/es/apps/refunds`
    | `/en/dashboard/transaction-details/:id`
    | `/fr/dashboard/transaction-details/:id`
    | `/ar/dashboard/transaction-details/:id`
    | `/es/dashboard/transaction-details/:id`]: string
}

export const publicRoutes = [
  '/',
  '/home',

  // English Routes
  '/en',
  '/en/',
  '/en/login',
  '/en/pages/auth/forgot-password',
  '/en/pages/auth/forgot-password/reset',
  '/en/register',
  '/en/home',
  '/en/about',
  '/en/contact',
  '/en/privacy-policy',
  '/en/terms-of-service',
  '/en/services',
  '/en/service-details/:id',
  '/en/blogs',
  '/en/blog-details/:slug',
  '/en/dashboard/service/:id',
  '/en/service-details',
  '/en/apps/subscriptions',

  // French Routes
  '/fr',
  '/fr/',
  '/fr/login',
  '/fr/pages/auth/forgot-password',
  '/fr/pages/auth/forgot-password/reset',
  '/fr/register',
  '/fr/home',
  '/fr/about',
  '/fr/contact',
  '/fr/privacy-policy',
  '/fr/terms-of-service',
  '/fr/services',
  '/fr/service-details/:id',
  '/fr/blogs',
  '/fr/blog-details/:slug',
  '/fr/dashboard/service/:id',
  '/fr/service-details',
  '/fr/apps/subscriptions',

  // Arabic Routes
  '/ar',
  '/ar/',
  '/ar/dashboard/service',
  '/ar/login',
  '/ar/pages/auth/forgot-password',
  '/ar/pages/auth/forgot-password/reset',
  '/ar/register',
  '/ar/home',
  '/ar/about',
  '/ar/contact',
  '/ar/privacy-policy',
  '/ar/terms-of-service',
  '/ar/services',
  '/ar/service-details/:id',
  '/ar/blogs',
  '/ar/blog-details/:slug',
  '/ar/dashboard/service/:id',
  '/ar/service-details',
  '/ar/apps/subscriptions',

  // Spanish (/es) Routes
  '/es',
  '/es/',
  '/es/login',
  '/es/pages/auth/forgot-password',
  '/es/pages/auth/forgot-password/reset',
  '/es/register',
  '/es/home',
  '/es/about',
  '/es/contact',
  '/es/privacy-policy',
  '/es/terms-of-service',
  '/es/services',
  '/es/service-details/:id',
  '/es/blogs',
  '/es/blog-details/:slug',
  '/es/dashboard/service',
  '/es/dashboard/service/:id',
  '/es/service-details',
  '/es/apps/services/:id',
  '/es/apps/subscriptions'
]

export const permissionMap: PermissionMap = {
  '/en/apps/clients': 'view_transclient',
  '/fr/apps/clients': 'view_transclient',
  '/ar/apps/clients': 'view_transclient',
  '/es/apps/clients': 'view_transclient',

  '/en/apps/leads': 'view_transclient',
  '/fr/apps/leads': 'view_transclient',
  '/ar/apps/leads': 'view_transclient',
  '/es/apps/leads': 'view_transclient',

  '/en/apps/users': 'view_staff',
  '/fr/apps/users': 'view_staff',
  '/ar/apps/users': 'view_staff',
  '/es/apps/users': 'view_staff',

  '/en/apps/positions': 'view_staffposition',
  '/fr/apps/positions': 'view_staffposition',
  '/ar/apps/positions': 'view_staffposition',
  '/es/apps/positions': 'view_staffposition',

  '/en/apps/staff': 'view_staff',
  '/fr/apps/staff': 'view_staff',
  '/ar/apps/staff': 'view_staff',
  '/es/apps/staff': 'view_staff',

  '/en/apps/groups': 'view_group',
  '/fr/apps/groups': 'view_group',
  '/ar/apps/groups': 'view_group',
  '/es/apps/groups': 'view_group',

  '/en/apps/lawyer-clients': 'view_lawyerclient',
  '/fr/apps/lawyer-clients': 'view_lawyerclient',
  '/ar/apps/lawyer-clients': 'view_lawyerclient',
  '/es/apps/lawyer-clients': 'view_lawyerclient',

  '/en/apps/lawyer-leads': 'view_lawyerclient',
  '/fr/apps/lawyer-leads': 'view_lawyerclient',
  '/ar/apps/lawyer-leads': 'view_lawyerclient',
  '/es/apps/lawyer-leads': 'view_lawyerclient',

  '/en/apps/cases': 'view_case',
  '/fr/apps/cases': 'view_case',
  '/ar/apps/cases': 'view_case',
  '/es/apps/cases': 'view_case',

  '/en/apps/docs-type': 'view_documenttype',
  '/fr/apps/docs-type': 'view_documenttype',
  '/ar/apps/docs-type': 'view_documenttype',
  '/es/apps/docs-type': 'view_documenttype',

  '/en/apps/notifications': 'view_notification',
  '/fr/apps/notifications': 'view_notification',
  '/ar/apps/notifications': 'view_notification',
  '/es/apps/notifications': 'view_notification',

  '/en/apps/coupons': 'view_coupon',
  '/fr/apps/coupons': 'view_coupon',
  '/ar/apps/coupons': 'view_coupon',
  '/es/apps/coupons': 'view_coupon',

  '/en/apps/orders': 'view_order',
  '/fr/apps/orders': 'view_order',
  '/ar/apps/orders': 'view_order',
  '/es/apps/orders': 'view_order',

  '/en/apps/transactions': 'adminAndSuperUserOnly',
  '/fr/apps/transactions': 'adminAndSuperUserOnly',
  '/ar/apps/transactions': 'adminAndSuperUserOnly',
  '/es/apps/transactions': 'adminAndSuperUserOnly',

  '/en/dashboard/transaction-details/:id': 'adminAndSuperUserOnly',
  '/fr/dashboard/transaction-details/:id': 'adminAndSuperUserOnly',
  '/ar/dashboard/transaction-details/:id': 'adminAndSuperUserOnly',
  '/es/dashboard/transaction-details/:id': 'adminAndSuperUserOnly',

  '/en/apps/case-types': 'view_casetype',
  '/fr/apps/case-types': 'view_casetype',
  '/ar/apps/case-types': 'view_casetype',
  '/es/apps/case-types': 'view_casetype',

  '/en/apps/services': 'adminAndSuperUserOnly',
  '/fr/apps/services': 'adminAndSuperUserOnly',
  '/ar/apps/services': 'adminAndSuperUserOnly',
  '/es/apps/services': 'adminAndSuperUserOnly',

  '/en/apps/services/:id': 'adminAndSuperUserOnly',
  '/fr/apps/services/:id': 'adminAndSuperUserOnly',
  '/ar/apps/services/:id': 'adminAndSuperUserOnly',
  '/es/apps/services/:id': 'adminAndSuperUserOnly',

  '/en/apps/service-categories': 'adminAndSuperUserOnly',
  '/fr/apps/service-categories': 'adminAndSuperUserOnly',
  '/ar/apps/service-categories': 'adminAndSuperUserOnly',
  '/es/apps/service-categories': 'adminAndSuperUserOnly',

  '/en/dashboard/service': 'adminAndSuperUserOnly',
  '/fr/dashboard/service': 'adminAndSuperUserOnly',
  '/ar/dashboard/service': 'adminAndSuperUserOnly',
  '/es/dashboard/service': 'adminAndSuperUserOnly',

  '/en/dashboard/service/:id': 'adminAndSuperUserOnly',
  '/fr/dashboard/service/:id': 'adminAndSuperUserOnly',
  '/ar/dashboard/service/:id': 'adminAndSuperUserOnly',
  '/es/dashboard/service/:id': 'adminAndSuperUserOnly',

  '/en/apps/invoices': 'adminAndSuperUserOnly',
  '/fr/apps/invoices': 'adminAndSuperUserOnly',
  '/ar/apps/invoices': 'adminAndSuperUserOnly',
  '/es/apps/invoices': 'adminAndSuperUserOnly',

  '/en/apps/refunds': 'adminAndSuperUserOnly',
  '/fr/apps/refunds': 'adminAndSuperUserOnly',
  '/ar/apps/refunds': 'adminAndSuperUserOnly',
  '/es/apps/refunds': 'adminAndSuperUserOnly'
}
