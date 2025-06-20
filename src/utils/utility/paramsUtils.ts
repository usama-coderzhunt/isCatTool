/**
 * Cleans and filters API parameters by:
 * 1. Removing undefined, null, and empty string values
 * 2. Trimming string values
 * 3. Only including parameters that have actual values
 *
 * @param params - Object containing API parameters
 * @returns Cleaned parameters object with only valid values
 */
export const cleanApiParams = <T extends Record<string, any>>(params: T): Partial<T> => {
  const cleanedParams: Partial<T> = {}

  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return

    if (typeof value === 'string') {
      const trimmedValue = value.trim()
      if (trimmedValue) {
        cleanedParams[key as keyof T] = trimmedValue as T[keyof T]
      }
      return
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        cleanedParams[key as keyof T] = value as T[keyof T]
      }
      return
    }

    if (value !== '') {
      cleanedParams[key as keyof T] = value as T[keyof T]
    }
  })

  return cleanedParams
}
