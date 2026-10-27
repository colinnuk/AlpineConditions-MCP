import { getCurrentAgent } from 'agents'
import { getBaseUrl } from '../config.js'
import {
  AvalancheAreaIdResponse,
  AvalancheBulletinResponse,
  AvailableModelsResponse,
  GeolocationResponse,
  HistoricalEstimateResponse,
  LocationInfoResponse,
  WeatherForecastResponse
} from '../types/alpineConditions.js'
import { getPartitionHeaderName, getUserIdClaims } from '../config.js'

const jsonHeaders = {
  'Content-Type': 'application/json'
}

const textEncoder = new TextEncoder()

const buildUrl = (path: string, query?: Record<string, string | number | (string | number)[] | undefined>): URL => {
  const url = new URL(path, `${getBaseUrl()}/`)

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined) continue
      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item))
        }
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }

  return url
}

const decodeBase64Url = (value: string): string | null => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddingLength = (4 - (normalized.length % 4)) % 4
  const padded = normalized.padEnd(normalized.length + paddingLength, '=')

  try {
    const decoded = atob(padded)
    const bytes = Uint8Array.from(decoded, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

const parseJwtPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split('.')
  if (parts.length < 2) {
    return null
  }

  const payload = decodeBase64Url(parts[1] ?? '')
  if (!payload) {
    return null
  }

  try {
    const parsed = JSON.parse(payload)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

const normalizeClaimValue = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const normalized = normalizeClaimValue(entry)
      if (normalized) {
        return normalized
      }
    }
  }

  return null
}

const hashToken = async (token: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(token))
  return Array.from(new Uint8Array(digest))
    .slice(0, 16)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

const buildPartitionToken = async (token: string): Promise<string> => {
  const payload = parseJwtPayload(token)
  if (payload) {
    for (const claimName of getUserIdClaims()) {
      const value = normalizeClaimValue(payload[claimName])
      if (value) {
        return value
      }
    }
  }

  return hashToken(token)
}

const buildRequestHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { ...jsonHeaders }
  const request = getCurrentAgent().request
  const authorization = request?.headers.get('authorization')?.trim()

  if (!authorization) {
    return headers
  }

  const [scheme, token] = authorization.split(/\s+/, 2)
  if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
    return headers
  }

  headers.Authorization = authorization
  headers[getPartitionHeaderName()] = await buildPartitionToken(token)
  return headers
}

const fetchJson = async <T>(url: URL): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: await buildRequestHeaders()
  })

  if (!response.ok) {
    throw new Error(`AlpineConditions API request failed: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    const body = await response.text()
    const preview = body.slice(0, 200).replace(/\s+/g, ' ').trim()
    throw new Error(`AlpineConditions API returned non-JSON content (${contentType || 'unknown'}): ${preview}`)
  }

  return (await response.json()) as T
}

export const getGeolocation = async (): Promise<GeolocationResponse> => {
  const url = buildUrl('/geolocation')
  return fetchJson<GeolocationResponse>(url)
}

export const getLocationInfo = async (latitude: number, longitude: number): Promise<LocationInfoResponse> => {
  const url = buildUrl('/weatherforecastapi/location', { latitude, longitude })
  return fetchJson<LocationInfoResponse>(url)
}

export const getAvailableModels = async (latitude: number, longitude: number): Promise<AvailableModelsResponse> => {
  const url = buildUrl('/weatherforecastapi/location/available-models-v2', { latitude, longitude })
  return fetchJson<AvailableModelsResponse>(url)
}

export const getWeatherForecast = async (
  latitude: number,
  longitude: number,
  models: string[]
): Promise<WeatherForecastResponse> => {
  if (models.length === 0) {
    return { weatherForecasts: [], modelNames: [] }
  }

  const url = buildUrl('/weatherforecastapi/weatherForecast', {
    latitude,
    longitude,
    weatherModels: models
  })

  return fetchJson<WeatherForecastResponse>(url)
}

export const getHistoricalEstimate = async (
  latitude: number,
  longitude: number
): Promise<HistoricalEstimateResponse> => {
  const url = buildUrl('/weatherforecastapi/historicalestimate', { latitude, longitude })
  return fetchJson<HistoricalEstimateResponse>(url)
}

export const getAvalancheAreaIdForLocation = async (
  latitude: number,
  longitude: number
): Promise<AvalancheAreaIdResponse> => {
  const url = buildUrl('/avalancheapi/avalanchebulletin/area-id/location', { latitude, longitude })
  return fetchJson<AvalancheAreaIdResponse>(url)
}

export const getAvalancheBulletinForAreaId = async (areaId: string): Promise<AvalancheBulletinResponse> => {
  const url = buildUrl(`/avalancheapi/avalanchebulletin/area/${encodeURIComponent(areaId)}`)
  return fetchJson<AvalancheBulletinResponse>(url)
}
