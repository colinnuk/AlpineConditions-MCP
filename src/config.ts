const DEFAULT_BASE_URL = 'https://apigateway.alpineconditions.com'
const DEFAULT_PARTITION_HEADER_NAME = 'X-AlpineConditions-User-Id'
const DEFAULT_PARTITION_CLAIMS = ['sub', 'oid', 'email', 'preferred_username', 'upn']

export type AlpineConditionsRuntimeEnv = {
  ALPINECONDITIONS_BASE_URL?: string
  ALPINECONDITIONS_FORCE_OAUTH?: string
  ALPINECONDITIONS_OAUTH_AUTHORIZATION_SERVERS?: string
  ALPINECONDITIONS_OAUTH_SCOPES?: string
  ALPINECONDITIONS_OAUTH_RESOURCE_NAME?: string
  ALPINECONDITIONS_PARTITION_HEADER_NAME?: string
  ALPINECONDITIONS_USER_ID_CLAIMS?: string
}

let runtimeEnvOverrides: AlpineConditionsRuntimeEnv = {}

const trimToUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

const getRuntimeEnvValue = (key: keyof AlpineConditionsRuntimeEnv): string | undefined => {
  const override = trimToUndefined(runtimeEnvOverrides[key])
  if (override) {
    return override
  }

  if (typeof process !== 'undefined') {
    return trimToUndefined(process.env[key])
  }

  return undefined
}

const parseList = (value: string | undefined): string[] => {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

const parseBoolean = (value: string | undefined): boolean => {
  if (!value) {
    return false
  }

  switch (value.trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
      return true
    default:
      return false
  }
}

export const setRuntimeEnvOverrides = (value: AlpineConditionsRuntimeEnv): void => {
  runtimeEnvOverrides = { ...value }
}

export const getBaseUrl = (): string => {
  const candidate = getRuntimeEnvValue('ALPINECONDITIONS_BASE_URL') || DEFAULT_BASE_URL
  return candidate.endsWith('/') ? candidate.slice(0, -1) : candidate
}

export const getForceOAuth = (): boolean => {
  return parseBoolean(getRuntimeEnvValue('ALPINECONDITIONS_FORCE_OAUTH'))
}

export const getOAuthAuthorizationServers = (): string[] => {
  return parseList(getRuntimeEnvValue('ALPINECONDITIONS_OAUTH_AUTHORIZATION_SERVERS'))
}

export const getOAuthScopes = (): string[] => {
  return parseList(getRuntimeEnvValue('ALPINECONDITIONS_OAUTH_SCOPES'))
}

export const getOAuthResourceName = (): string | undefined => {
  return getRuntimeEnvValue('ALPINECONDITIONS_OAUTH_RESOURCE_NAME')
}

export const getPartitionHeaderName = (): string => {
  return getRuntimeEnvValue('ALPINECONDITIONS_PARTITION_HEADER_NAME') || DEFAULT_PARTITION_HEADER_NAME
}

export const getUserIdClaims = (): string[] => {
  const configuredClaims = parseList(getRuntimeEnvValue('ALPINECONDITIONS_USER_ID_CLAIMS'))
  return configuredClaims.length > 0 ? configuredClaims : DEFAULT_PARTITION_CLAIMS
}
