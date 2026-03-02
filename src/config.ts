const DEFAULT_BASE_URL = 'https://apigateway.alpineconditions.com'

export const getBaseUrl = (): string => {
  const candidate = process.env.ALPINECONDITIONS_BASE_URL?.trim() || DEFAULT_BASE_URL
  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate
}
