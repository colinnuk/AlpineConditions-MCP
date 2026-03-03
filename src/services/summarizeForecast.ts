import { WeatherForecastDto } from '../types/alpineConditions.js'

interface ForecastSummary {
  model: string
  localTimeZone: string
  firstLocalTime: string | null
  hoursAvailable: number
  snowfallTotalCm: number | null
  snowfallNext24hCm: number | null
  rainNext24hMm: number | null
  slr: {
    totalPeriod: number | null
    next24h: number | null
  }
  minTemperatureC: number | null
  maxWindGustKph: number | null
  minFreezingLevelM: number | null
}

interface ForecastChunkSummary {
  chunkStartTimeLocal: string | null
  chunkEndTimeLocal: string | null
  points: number
  temperature: {
    minC: number | null
    maxC: number | null
    avgC: number | null
  }
  rain: {
    totalMm: number | null
  }
  snowfall: {
    totalCm: number | null
  }
  slr: {
    weightedAverage: number | null
  }
  wind: {
    avgSpeedKph: number | null
    maxGustKph: number | null
  }
  freezingLevel: {
    minM: number | null
    maxM: number | null
  }
  dominantWeatherDescription: string | null
}

interface ForecastByModelSummary {
  model: string
  localTimeZone: string
  chunkHours: number
  chunks: ForecastChunkSummary[]
}

const finiteValues = (values: (number | null)[] | null): number[] => {
  if (!values) return []
  return values.filter((value): value is number => Number.isFinite(value))
}

const finiteValuesAt = (values: (number | null)[] | null, indexes: number[]): number[] => {
  if (!values) return []

  const result: number[] = []
  for (const index of indexes) {
    const value = values[index]
    if (Number.isFinite(value)) {
      result.push(value as number)
    }
  }
  return result
}

const sumValues = (values: (number | null)[] | null, limit?: number): number | null => {
  const cleaned = finiteValues(values)
  if (cleaned.length === 0) return null

  const toUse = typeof limit === 'number' ? cleaned.slice(0, limit) : cleaned
  return toUse.reduce((acc, current) => acc + current, 0)
}

const minValue = (values: (number | null)[] | null): number | null => {
  const cleaned = finiteValues(values)
  if (cleaned.length === 0) return null
  return Math.min(...cleaned)
}

const maxValue = (values: (number | null)[] | null): number | null => {
  const cleaned = finiteValues(values)
  if (cleaned.length === 0) return null
  return Math.max(...cleaned)
}

const avgValue = (values: number[]): number | null => {
  if (values.length === 0) return null
  return values.reduce((acc, current) => acc + current, 0) / values.length
}

const weightedSlrAt = (
  slrValues: (number | null)[] | null,
  snowfall: (number | null)[] | null,
  indexes: number[]
): number | null => {
  if (!slrValues) return null

  let weightedSlrSum = 0
  let snowfallWeightTotalCm = 0
  let unweightedSlrSum = 0
  let unweightedCount = 0

  for (const index of indexes) {
    const slrValue = slrValues[index]
    const snowfallValue = snowfall?.[index]
    if (typeof slrValue !== 'number' || !Number.isFinite(slrValue)) continue

    unweightedSlrSum += slrValue
    unweightedCount += 1

    if (typeof snowfallValue !== 'number' || !Number.isFinite(snowfallValue)) continue
    if (snowfallValue <= 0) continue

    weightedSlrSum += slrValue * snowfallValue
    snowfallWeightTotalCm += snowfallValue
  }

  if (snowfallWeightTotalCm > 0) {
    return weightedSlrSum / snowfallWeightTotalCm
  }

  if (unweightedCount === 0) return null

  return unweightedSlrSum / unweightedCount
}

const dominantWeatherDescriptionAt = (
  weatherDescriptions: (string | null)[] | null,
  indexes: number[]
): string | null => {
  if (!weatherDescriptions) return null

  const counts = new Map<string, number>()
  for (const index of indexes) {
    const value = weatherDescriptions[index]
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  let winner: string | null = null
  let maxCount = 0
  for (const [value, count] of counts.entries()) {
    if (count > maxCount) {
      winner = value
      maxCount = count
    }
  }

  return winner
}

const createIndexChunks = (length: number, chunkSize: number): number[][] => {
  const chunks: number[][] = []

  for (let start = 0; start < length; start += chunkSize) {
    const indexes: number[] = []
    for (let index = start; index < Math.min(start + chunkSize, length); index++) {
      indexes.push(index)
    }
    chunks.push(indexes)
  }

  return chunks
}

const summarizeForecastInChunks = (forecast: WeatherForecastDto, chunkHours = 6): ForecastByModelSummary => {
  const localTimes = forecast.forecastDataDateTimeLocal ?? forecast.forecastDataDateTimeUtc ?? []
  const chunks = createIndexChunks(localTimes.length, chunkHours)

  return {
    model: forecast.weatherModel,
    localTimeZone: forecast.localTimeZone,
    chunkHours,
    chunks: chunks.map((indexes) => {
      const firstIndex = indexes[0]
      const lastIndex = indexes[indexes.length - 1]
      const tempValues = finiteValuesAt(forecast.temperature_2m, indexes)
      const rainValues = finiteValuesAt(forecast.rain, indexes)
      const snowfallValues = finiteValuesAt(forecast.snowfall, indexes)
      const windSpeedValues = finiteValuesAt(forecast.windSpeed_10m, indexes)
      const windGustValues = finiteValuesAt(forecast.windGusts_10m, indexes)
      const freezingLevelValues = finiteValuesAt(forecast.freezingLevel, indexes)

      return {
        chunkStartTimeLocal: typeof firstIndex === 'number' ? localTimes[firstIndex] ?? null : null,
        chunkEndTimeLocal: typeof lastIndex === 'number' ? localTimes[lastIndex] ?? null : null,
        points: indexes.length,
        temperature: {
          minC: tempValues.length > 0 ? Math.min(...tempValues) : null,
          maxC: tempValues.length > 0 ? Math.max(...tempValues) : null,
          avgC: avgValue(tempValues)
        },
        rain: {
          totalMm: rainValues.length > 0 ? rainValues.reduce((acc, v) => acc + v, 0) : null
        },
        snowfall: {
          totalCm: snowfallValues.length > 0 ? snowfallValues.reduce((acc, v) => acc + v, 0) : null
        },
        slr: {
          weightedAverage: weightedSlrAt(forecast.snowLiquidRatio, forecast.snowfall, indexes)
        },
        wind: {
          avgSpeedKph: avgValue(windSpeedValues),
          maxGustKph: windGustValues.length > 0 ? Math.max(...windGustValues) : null
        },
        freezingLevel: {
          minM: freezingLevelValues.length > 0 ? Math.min(...freezingLevelValues) : null,
          maxM: freezingLevelValues.length > 0 ? Math.max(...freezingLevelValues) : null
        },
        dominantWeatherDescription: dominantWeatherDescriptionAt(
          forecast.weatherDescription as (string | null)[] | null,
          indexes
        )
      }
    })
  }
}

const formatModelSummary = (forecast: WeatherForecastDto): ForecastSummary => {
  const timeline = forecast.forecastDataDateTimeLocal ?? forecast.forecastDataDateTimeUtc ?? []
  const totalIndexes = timeline.map((_, index) => index)
  const next24hIndexes = totalIndexes.slice(0, 24)

  return {
    model: forecast.weatherModel,
    localTimeZone: forecast.localTimeZone,
    firstLocalTime: forecast.forecastDataDateTimeLocal?.[0] ?? null,
    hoursAvailable: forecast.forecastDataDateTimeLocal?.length ?? 0,
    snowfallTotalCm: sumValues(forecast.snowfall),
    snowfallNext24hCm: sumValues(forecast.snowfall, 24),
    rainNext24hMm: sumValues(forecast.rain, 24),
    slr: {
      totalPeriod: weightedSlrAt(forecast.snowLiquidRatio, forecast.snowfall, totalIndexes),
      next24h: weightedSlrAt(forecast.snowLiquidRatio, forecast.snowfall, next24hIndexes)
    },
    minTemperatureC: minValue(forecast.temperature_2m),
    maxWindGustKph: maxValue(forecast.windGusts_10m),
    minFreezingLevelM: minValue(forecast.freezingLevel)
  }
}

export const summarizeForecasts = (forecasts: WeatherForecastDto[]): ForecastSummary[] => {
  return forecasts.map(formatModelSummary)
}

export const summarizeForecastsBy6HourChunks = (forecasts: WeatherForecastDto[]): ForecastByModelSummary[] => {
  return forecasts.map((forecast) => summarizeForecastInChunks(forecast, 6))
}
