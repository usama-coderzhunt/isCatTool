export const getDisplayValue = (value: any): string => {
  return value?.length ? String(value).trim() : '-'
}

export const getDisplayDateTime = (value: any): string => {
  return value ? new Date(value).toLocaleString() : '-'
}

export const getDisplayProvider = (provider: string | null | undefined): string => {
  if (!provider || provider.trim() === '') {
    return 'Stripe'
  }

  const providerMap: Record<string, string> = {
    paypal: 'PayPal',
    stripe: 'Stripe',
    manual: 'Manual'
  }

  return providerMap[provider.toLowerCase()] || 'Stripe'
}
