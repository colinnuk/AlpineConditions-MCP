import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import {
  getAvailableModels,
  getGeolocation,
  getLocationInfo,
  getWeatherForecast
} from './services/alpineConditionsApi.js'
import { summarizeForecasts } from './services/summarizeForecast.js'

const numberSchema = z.number().finite()

const chooseDefaultModels = async (latitude: number, longitude: number): Promise<string[]> => {
  const available = await getAvailableModels(latitude, longitude)
  const ordered = [...available.models].sort((a, b) => a.sortOrder - b.sortOrder)
  return ordered.slice(0, 3).map((model) => model.model)
}

export const createMcpServer = () => {
  const server = new McpServer({
    name: 'alpineconditions-mcp',
    version: '0.1.0'
  })

  server.tool(
    'get_mountain_weather_forecast',
    'Loads mountain-focused weather forecast data for coordinates from alpineconditions.com.',
    {
      latitude: numberSchema.describe('Latitude in decimal degrees.'),
      longitude: numberSchema.describe('Longitude in decimal degrees.'),
      models: z.array(z.string().min(1)).optional().describe('Optional weather model names. If omitted, top 3 available models are used.')
    },
    async ({ latitude, longitude, models }) => {
      const requestedModels = models && models.length > 0 ? models : await chooseDefaultModels(latitude, longitude)

      const [location, forecast] = await Promise.all([
        getLocationInfo(latitude, longitude),
        getWeatherForecast(latitude, longitude, requestedModels)
      ])

      const result = {
        requestedCoordinates: { latitude, longitude },
        locationName: location.name,
        elevationM: location.location.elevation,
        timeZone: location.timeZone,
        modelsUsed: forecast.modelNames.length > 0 ? forecast.modelNames : requestedModels,
        mountainSummaryByModel: summarizeForecasts(forecast.weatherForecasts),
        rawForecasts: forecast.weatherForecasts
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

  return {
    server,
    async start() {
      const transport = new StdioServerTransport()
      await server.connect(transport)
    }
  }
}
