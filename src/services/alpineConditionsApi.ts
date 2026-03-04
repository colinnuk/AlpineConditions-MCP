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

const jsonHeaders = {
  'Content-Type': 'application/json'
}

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

const fetchJson = async <T>(url: URL): Promise<T> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: jsonHeaders
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
