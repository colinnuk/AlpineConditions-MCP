import { LocationWithElevation } from './LocationWithElevation'

export interface HistoricalEstimateDto {
  timestampUtc: string
  location: LocationWithElevation
  dateTimeUtc: string[] | null
  temperature_2m: (number | null)[] | null
  precipitation: (number | null)[] | null
  rain: (number | null)[] | null
  snowfall: (number | null)[] | null
  snowLiquidRatio: (number | null)[] | null
  windSpeed_10m: (number | null)[] | null
  windDirection_10m: (number | null)[] | null
  windGusts_10m: (number | null)[] | null
  cloudCover: (number | null)[] | null
}
