import { WeatherForecastDto } from '../types/alpineConditions.js'

interface ForecastSummary {
  model: string
  localTimeZone: string
  firstLocalTime: string | null
  hoursAvailable: number
  snowfallTotalMm: number | null
  snowfallNext24hMm: number | null
  precipitationNext24hMm: number | null
  minTemperatureC: number | null
  maxWindGustKph: number | null
  minFreezingLevelM: number | null
  maxRainSnowLevelM: number | null
}

const finiteValues = (values: (number | null)[] | null): number[] => {
  if (!values) return []
  return values.filter((value): value is number => Number.isFinite(value))
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

const formatModelSummary = (forecast: WeatherForecastDto): ForecastSummary => {
  return {
    model: forecast.weatherModel,
    localTimeZone: forecast.localTimeZone,
    firstLocalTime: forecast.forecastDataDateTimeLocal?.[0] ?? null,
    hoursAvailable: forecast.forecastDataDateTimeLocal?.length ?? 0,
    snowfallTotalMm: sumValues(forecast.snowfall),
    snowfallNext24hMm: sumValues(forecast.snowfall, 24),
    precipitationNext24hMm: sumValues(forecast.precipitation, 24),
    minTemperatureC: minValue(forecast.temperature_2m),
    maxWindGustKph: maxValue(forecast.windGusts_10m),
    minFreezingLevelM: minValue(forecast.freezingLevel),
    maxRainSnowLevelM: maxValue(forecast.rainSnowLevel)
  }
}

export const summarizeForecasts = (forecasts: WeatherForecastDto[]): ForecastSummary[] => {
  return forecasts.map(formatModelSummary)
}
