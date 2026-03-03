import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  getAvailableModels,
  getGeolocation,
  getHistoricalEstimate,
  getLocationInfo,
  getWeatherForecast
} from './services/alpineConditionsApi.js'
import {
  buildLocationModelGuidance,
  buildSelectedModelGuidance,
  chooseDefaultForecastModels
} from './services/modelGuidance.js'
import { summarizeForecasts, summarizeForecastsBy6HourChunks } from './services/summarizeForecast.js'
import {
  summarizeHistoricalEstimate,
  summarizeHistoricalEstimateBy6HourChunks
} from './services/summarizeHistoricalEstimate.js'

const numberSchema = z.number().finite()

export const registerTools = (server: McpServer): void => {
  server.tool(
    'get_weather_forecast',
    'Loads weather forecast data for coordinates from alpineconditions.com.',
    {
      latitude: numberSchema.describe('Latitude in decimal degrees.'),
      longitude: numberSchema.describe('Longitude in decimal degrees.'),
      models: z.array(z.string().min(1)).optional().describe('Optional weather model names. If omitted, top 3 available models are used.')
    },
    async ({ latitude, longitude, models }) => {
      const available = await getAvailableModels(latitude, longitude)
      const requestedModels =
        models && models.length > 0 ? models : chooseDefaultForecastModels(available.models)

      const [location, forecast] = await Promise.all([
        getLocationInfo(latitude, longitude),
        getWeatherForecast(latitude, longitude, requestedModels)
      ])
      const modelsUsed = forecast.modelNames.length > 0 ? forecast.modelNames : requestedModels

      const result = {
        location: {
          requestedCoordinates: { latitude, longitude },
          locationName: location.name,
          elevationM: location.location.elevation,
          timeZone: location.timeZone
        },
        models: {
          used: modelsUsed,
          selectedModelGuidance: buildSelectedModelGuidance(available.models, modelsUsed),
          locationModelGuidance: buildLocationModelGuidance(available.models)
        },
        forecast: {
          overviewByModel: summarizeForecasts(forecast.weatherForecasts),
          sixHourlyByModel: summarizeForecastsBy6HourChunks(forecast.weatherForecasts)
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }
  )

  server.tool(
    'get_weather_model_guidance',
    'Loads weather model guidance for a location, including Blend and high-resolution model availability.',
    {
      latitude: numberSchema.describe('Latitude in decimal degrees.'),
      longitude: numberSchema.describe('Longitude in decimal degrees.')
    },
    async ({ latitude, longitude }) => {
      const available = await getAvailableModels(latitude, longitude)

      const result = {
        requestedCoordinates: { latitude, longitude },
        defaultModelSelection: chooseDefaultForecastModels(available.models),
        locationModelGuidance: buildLocationModelGuidance(available.models)
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }
  )

  server.tool(
    'get_historical_weather_estimate',
    'Loads historical weather estimate data for coordinates from alpineconditions.com for approximately the last 6 days.',
    {
      latitude: numberSchema.describe('Latitude in decimal degrees.'),
      longitude: numberSchema.describe('Longitude in decimal degrees.')
    },
    async ({ latitude, longitude }) => {
      const [location, historical] = await Promise.all([
        getLocationInfo(latitude, longitude),
        getHistoricalEstimate(latitude, longitude)
      ])

      const estimate = historical.estimate
      const result = {
        location: {
          requestedCoordinates: { latitude, longitude },
          locationName: location.name,
          elevationM: location.location.elevation,
          timeZone: location.timeZone
        },
        historicalEstimate: {
          overview: summarizeHistoricalEstimate(estimate),
          sixHourly: summarizeHistoricalEstimateBy6HourChunks(estimate)
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }
  )

  server.tool(
    'get_location_name_from_geolocation',
    'Uses alpineconditions geolocation endpoint, then resolves a human-readable location name.',
    {},
    async () => {
      const geolocation = await getGeolocation()

      if (!geolocation.latitude || !geolocation.longitude) {
        throw new Error('Geolocation endpoint did not return latitude/longitude.')
      }

      const latitude = Number(geolocation.latitude)
      const longitude = Number(geolocation.longitude)

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Geolocation endpoint returned non-numeric coordinates.')
      }

      const location = await getLocationInfo(latitude, longitude)

      const result = {
        geolocation,
        resolvedLocation: {
          name: location.name,
          timeZone: location.timeZone,
          location: location.location
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      }
    }
  )
}
