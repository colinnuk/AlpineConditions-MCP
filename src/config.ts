const DEFAULT_BASE_URL = 'https://apigateway.alpineconditions.com'

let baseUrlOverride: string | undefined

export const setBaseUrlOverride = (value: string | undefined): void => {
  baseUrlOverride = value?.trim() || undefined
}

export const getBaseUrl = (): string => {
  const envValue = typeof process !== 'undefined' ? process.env.ALPINECONDITIONS_BASE_URL?.trim() : undefined
  const candidate = baseUrlOverride || envValue || DEFAULT_BASE_URL
  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate
}
