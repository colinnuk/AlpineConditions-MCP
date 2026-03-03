import { HistoricalEstimateDto } from '../types/alpineConditions.js'

interface HistoricalEstimateOverview {
  generatedAtUtc: string
  hoursAvailable: number
  firstTimeUtc: string | null
  lastTimeUtc: string | null
  temperature: {
    minC: number | null
    maxC: number | null
    avgC: number | null
  }
  precipitation: {
    totalMm: number | null
    rainTotalMm: number | null
    snowfallTotalMm: number | null
    maxHourlyMm: number | null
  }
  snowLiquidRatio: {
    avg: number | null
  }
  wind: {
    avgSpeedKph: number | null
    maxGustKph: number | null
  }
  cloudCover: {
    avgPercent: number | null
    maxPercent: number | null
  }
}

interface HistoricalEstimateChunkSummary {
  chunkStartTimeUtc: string | null
  chunkEndTimeUtc: string | null
  points: number
  temperature: {
    minC: number | null
    maxC: number | null
    avgC: number | null
  }
  precipitation: {
    totalMm: number | null
    rainTotalMm: number | null
    snowfallTotalMm: number | null
  }
  snowLiquidRatio: {
    avg: number | null
  }
  wind: {
    avgSpeedKph: number | null
    avgDirectionDeg: number | null
    maxGustKph: number | null
  }
  cloudCover: {
    avgPercent: number | null
    maxPercent: number | null
  }
}

interface HistoricalEstimateChunkedSummary {
  chunkHours: number
  chunks: HistoricalEstimateChunkSummary[]
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

const sumOrNull = (values: number[]): number | null => {
  if (values.length === 0) return null
  return values.reduce((acc, current) => acc + current, 0)
}

const avgOrNull = (values: number[]): number | null => {
  if (values.length === 0) return null
  return values.reduce((acc, current) => acc + current, 0) / values.length
}

const minOrNull = (values: number[]): number | null => {
  if (values.length === 0) return null
  return Math.min(...values)
}

const maxOrNull = (values: number[]): number | null => {
  if (values.length === 0) return null
  return Math.max(...values)
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

export const summarizeHistoricalEstimate = (estimate: HistoricalEstimateDto): HistoricalEstimateOverview => {
  const timeline = estimate.dateTimeUtc ?? []
  const temperatures = finiteValues(estimate.temperature_2m)
  const precipitation = finiteValues(estimate.precipitation)
  const rain = finiteValues(estimate.rain)
  const snowfall = finiteValues(estimate.snowfall)
  const snowLiquidRatio = finiteValues(estimate.snowLiquidRatio)
  const windSpeed = finiteValues(estimate.windSpeed_10m)
  const windGusts = finiteValues(estimate.windGusts_10m)
  const cloudCover = finiteValues(estimate.cloudCover)

  return {
    generatedAtUtc: estimate.timestampUtc,
    hoursAvailable: timeline.length,
    firstTimeUtc: timeline[0] ?? null,
    lastTimeUtc: timeline.length > 0 ? timeline[timeline.length - 1] ?? null : null,
    temperature: {
      minC: minOrNull(temperatures),
      maxC: maxOrNull(temperatures),
      avgC: avgOrNull(temperatures)
    },
    precipitation: {
      totalMm: sumOrNull(precipitation),
      rainTotalMm: sumOrNull(rain),
      snowfallTotalMm: sumOrNull(snowfall),
      maxHourlyMm: maxOrNull(precipitation)
    },
    snowLiquidRatio: {
      avg: avgOrNull(snowLiquidRatio)
    },
    wind: {
      avgSpeedKph: avgOrNull(windSpeed),
      maxGustKph: maxOrNull(windGusts)
    },
    cloudCover: {
      avgPercent: avgOrNull(cloudCover),
      maxPercent: maxOrNull(cloudCover)
    }
  }
}

export const summarizeHistoricalEstimateBy6HourChunks = (
  estimate: HistoricalEstimateDto
): HistoricalEstimateChunkedSummary => {
  const timeline = estimate.dateTimeUtc ?? []
  const chunkHours = 6
  const chunks = createIndexChunks(timeline.length, chunkHours)

  return {
    chunkHours,
    chunks: chunks.map((indexes) => {
      const firstIndex = indexes[0]
      const lastIndex = indexes[indexes.length - 1]
      const temperatures = finiteValuesAt(estimate.temperature_2m, indexes)
      const precipitation = finiteValuesAt(estimate.precipitation, indexes)
      const rain = finiteValuesAt(estimate.rain, indexes)
      const snowfall = finiteValuesAt(estimate.snowfall, indexes)
      const snowLiquidRatio = finiteValuesAt(estimate.snowLiquidRatio, indexes)
      const windSpeed = finiteValuesAt(estimate.windSpeed_10m, indexes)
      const windDirection = finiteValuesAt(estimate.windDirection_10m, indexes)
      const windGusts = finiteValuesAt(estimate.windGusts_10m, indexes)
      const cloudCover = finiteValuesAt(estimate.cloudCover, indexes)

      return {
        chunkStartTimeUtc: typeof firstIndex === 'number' ? timeline[firstIndex] ?? null : null,
        chunkEndTimeUtc: typeof lastIndex === 'number' ? timeline[lastIndex] ?? null : null,
        points: indexes.length,
        temperature: {
          minC: minOrNull(temperatures),
          maxC: maxOrNull(temperatures),
          avgC: avgOrNull(temperatures)
        },
        precipitation: {
          totalMm: sumOrNull(precipitation),
          rainTotalMm: sumOrNull(rain),
          snowfallTotalMm: sumOrNull(snowfall)
        },
        snowLiquidRatio: {
          avg: avgOrNull(snowLiquidRatio)
        },
        wind: {
          avgSpeedKph: avgOrNull(windSpeed),
          avgDirectionDeg: avgOrNull(windDirection),
          maxGustKph: maxOrNull(windGusts)
        },
        cloudCover: {
          avgPercent: avgOrNull(cloudCover),
          maxPercent: maxOrNull(cloudCover)
        }
      }
    })
  }
}
