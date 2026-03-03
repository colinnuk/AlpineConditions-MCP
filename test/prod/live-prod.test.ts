import assert from 'node:assert/strict'
import test from 'node:test'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createMcpServer } from '../../src/server.js'

const connectClientAndServer = async () => {
  process.env.ALPINECONDITIONS_BASE_URL = 'https://apigateway.alpineconditions.com'

  const server = createMcpServer()
  const client = new Client(
    { name: 'alpineconditions-prod-test', version: '0.1.0' },
    { capabilities: {} }
  )
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])

  const close = async () => {
    await Promise.all([client.close(), server.close()])
  }

  return { client, close }
}

type TextContentItem = { type: 'text'; text: string }
type ToolCallResultLike = {
  isError?: boolean
  content?: Array<{ type?: string; text?: unknown }>
}

const parseToolTextResponse = (result: Awaited<ReturnType<Client['callTool']>>) => {
  const payload = result as ToolCallResultLike
  assert.equal(Boolean(payload.isError), false, 'Tool response was marked as an error')
  const text = payload.content
    ?.find((item): item is TextContentItem => item.type === 'text' && typeof item.text === 'string')
    ?.text
  assert.ok(text, 'Expected text content in tool response')
  return JSON.parse(text)
}

test('production forecast tool returns usable weather data', { timeout: 60_000 }, async () => {
  const { client, close } = await connectClientAndServer()

  try {
    const result = await client.callTool({
      name: 'get_weather_forecast',
      arguments: {
        latitude: 46.8523,
        longitude: -121.7603
      }
    })

    const payload = parseToolTextResponse(result) as {
      location: {
        requestedCoordinates: { latitude: number; longitude: number }
        locationName: string | null
        timeZone: string
      }
      models: {
        used: string[]
        selectedModelGuidance: Array<{ model: string; guidance: string }>
        locationModelGuidance: {
          blendModelAvailable: boolean
          highResolutionModelsAvailable: Array<{ model: string }>
        }
      }
      forecast: {
        overviewByModel: Array<{ model: string }>
        sixHourlyByModel: Array<{
          model: string
          chunkHours: number
          chunks: Array<{
            points: number
            temperature: { minC: number | null; maxC: number | null; avgC: number | null }
          }>
        }>
      }
    }

    assert.equal(payload.location.requestedCoordinates.latitude, 46.8523)
    assert.equal(payload.location.requestedCoordinates.longitude, -121.7603)
    assert.equal(typeof payload.location.timeZone, 'string')
    assert.ok(payload.location.timeZone.length > 0, 'location.timeZone should not be empty')
    assert.ok(payload.models.used.length > 0, 'models.used should not be empty')
    assert.equal(payload.models.selectedModelGuidance.length, payload.models.used.length)
    assert.ok(payload.models.selectedModelGuidance.every((m) => m.guidance.length > 0))
    assert.equal(typeof payload.models.locationModelGuidance.blendModelAvailable, 'boolean')
    assert.ok(payload.forecast.overviewByModel.length > 0, 'forecast.overviewByModel should not be empty')
    assert.ok(payload.forecast.sixHourlyByModel.length > 0, 'forecast.sixHourlyByModel should not be empty')
    assert.ok(
      payload.forecast.sixHourlyByModel.every((modelSummary) => modelSummary.chunkHours === 6),
      'every model should use 6-hour chunking'
    )
    assert.ok(
      payload.forecast.sixHourlyByModel.some((modelSummary) => modelSummary.chunks.length > 0),
      'at least one model should contain chunked data'
    )
  } finally {
    await close()
  }
})

test('production historical estimate tool returns usable recent-history data', { timeout: 60_000 }, async () => {
  const { client, close } = await connectClientAndServer()

  try {
    const result = await client.callTool({
      name: 'get_historical_weather_estimate',
      arguments: {
        latitude: 46.8523,
        longitude: -121.7603
      }
    })

    const payload = parseToolTextResponse(result) as {
      location: {
        requestedCoordinates: { latitude: number; longitude: number }
        locationName: string | null
        timeZone: string
      }
      historicalEstimate: {
        overview: {
          generatedAtUtc: string
          hoursAvailable: number
          temperature: { minC: number | null; maxC: number | null; avgC: number | null }
          precipitation: { totalMm: number | null }
          wind: { maxGustKph: number | null }
        }
        sixHourly: {
          chunkHours: number
          chunks: Array<{
            points: number
            temperature: { minC: number | null; maxC: number | null; avgC: number | null }
            precipitation: { totalMm: number | null }
          }>
        }
      }
    }

    assert.equal(payload.location.requestedCoordinates.latitude, 46.8523)
    assert.equal(payload.location.requestedCoordinates.longitude, -121.7603)
    assert.equal(typeof payload.location.timeZone, 'string')
    assert.ok(payload.location.timeZone.length > 0, 'location.timeZone should not be empty')
    assert.equal(typeof payload.historicalEstimate.overview.generatedAtUtc, 'string')
    assert.ok(payload.historicalEstimate.overview.generatedAtUtc.length > 0)
    assert.ok(payload.historicalEstimate.overview.hoursAvailable > 0)
    assert.equal(payload.historicalEstimate.sixHourly.chunkHours, 6)
    assert.ok(payload.historicalEstimate.sixHourly.chunks.length > 0)
    assert.ok(
      payload.historicalEstimate.sixHourly.chunks.every((chunk) => chunk.points > 0),
      'all six-hour chunks should include at least one point'
    )
  } finally {
    await close()
  }
})

test('production geolocation tool resolves a location name and coordinates', { timeout: 60_000 }, async () => {
  const { client, close } = await connectClientAndServer()

  try {
    const result = await client.callTool({
      name: 'get_location_name_from_geolocation',
      arguments: {}
    })

    const payload = parseToolTextResponse(result) as {
      geolocation: { latitude: string | null; longitude: string | null }
      resolvedLocation: {
        name: string | null
        timeZone: string
        location: { latitude: number; longitude: number; elevation: number }
      }
    }

    assert.ok(payload.geolocation.latitude, 'geolocation.latitude is missing')
    assert.ok(payload.geolocation.longitude, 'geolocation.longitude is missing')
    assert.equal(typeof payload.resolvedLocation.timeZone, 'string')
    assert.ok(payload.resolvedLocation.timeZone.length > 0, 'resolvedLocation.timeZone should not be empty')
    assert.ok(Number.isFinite(payload.resolvedLocation.location.latitude))
    assert.ok(Number.isFinite(payload.resolvedLocation.location.longitude))
  } finally {
    await close()
  }
})

test('weather model guidance tool returns location-aware Blend and high-res details', { timeout: 60_000 }, async () => {
  const { client, close } = await connectClientAndServer()

  try {
    const result = await client.callTool({
      name: 'get_weather_model_guidance',
      arguments: {
        latitude: 46.8523,
        longitude: -121.7603
      }
    })

    const payload = parseToolTextResponse(result) as {
      defaultModelSelection: string[]
      locationModelGuidance: {
        blendModelAvailable: boolean
        highResolutionModelsAvailable: Array<{ model: string; isHighResolution: boolean }>
        availableModels: Array<{ model: string; guidance: string }>
      }
    }

    assert.ok(payload.defaultModelSelection.length > 0)
    assert.equal(typeof payload.locationModelGuidance.blendModelAvailable, 'boolean')
    assert.ok(payload.locationModelGuidance.availableModels.length > 0)
    assert.ok(payload.locationModelGuidance.availableModels.every((m) => m.guidance.length > 0))
    assert.ok(
      payload.locationModelGuidance.highResolutionModelsAvailable.every((m) => m.isHighResolution),
      'highResolutionModelsAvailable should only contain high-resolution models'
    )
  } finally {
    await close()
  }
})
