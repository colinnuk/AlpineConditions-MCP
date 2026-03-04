export interface LocationWithElevation {
  latitude: number
  longitude: number
  elevation: number
}

export interface LocationInfoResponse {
  timeZone: string
  location: LocationWithElevation
  name: string | null
}

export interface GeolocationResponse {
  latitude: string | null
  longitude: string | null
  countryTwoLetterCode: string | null
}

export interface AvalancheAreaIdResponse {
  areaId: string
  latitude: number
  longitude: number
  issuer: string | null
  timestampUtc: string
}

export interface AvalancheNamedValue {
  value: string
  display: string
}

export interface AvalancheOwner {
  display: string
  url: string | null
}

export interface AvalancheArea {
  id: string
  name: string
}

export interface AvalancheReportConfidence {
  rating: AvalancheNamedValue | null
  statements: string[]
}

export interface AvalancheSummaryBlock {
  type: AvalancheNamedValue
  content: string
}

export interface AvalancheDangerRatingLevel {
  display: string
  rating: AvalancheNamedValue | null
}

export interface AvalancheDangerRatingSet {
  alp?: AvalancheDangerRatingLevel
  tln?: AvalancheDangerRatingLevel
  btl?: AvalancheDangerRatingLevel
}

export interface AvalancheDangerRating {
  date: string
  ratings: AvalancheDangerRatingSet
}

export interface AvalancheProblemData {
  elevations?: AvalancheNamedValue[]
  aspects?: AvalancheNamedValue[]
  likelihood?: AvalancheNamedValue | null
  expectedSize?: {
    min?: string | null
    max?: string | null
  } | null
}

export interface AvalancheProblem {
  type: AvalancheNamedValue
  comment?: string | null
  data?: AvalancheProblemData | null
}

export interface AvalancheReport {
  forecaster?: string | null
  dateIssued: string
  validUntil: string
  title?: string | null
  highlights?: string | null
  confidence?: AvalancheReportConfidence | null
  summaries: AvalancheSummaryBlock[]
  dangerRatings: AvalancheDangerRating[]
  problems: AvalancheProblem[]
  terrainAndTravelAdvice: string[]
}

export interface AvalancheBulletinResponse {
  id: string
  url: string
  issuer: string | null
  area: AvalancheArea
  report: AvalancheReport
  owner?: AvalancheOwner | null
}

export interface WeatherForecastDto {
  timestampUtc: string
  requestedLocation: LocationWithElevation
  modelLocation: LocationWithElevation
  weatherModel: string
  localTimeZone: string
  geocodedLocation: string | null
  forecastDataDateTimeUtc: string[] | null
  forecastDataDateTimeLocal: string[] | null
  temperature_2m: (number | null)[] | null
  precipitation: (number | null)[] | null
  rain: (number | null)[] | null
  snowfall: (number | null)[] | null
  snowLiquidRatio: (number | null)[] | null
  cloudCover: (number | null)[] | null
  windSpeed_10m: (number | null)[] | null
  windDirection_10m: (number | null)[] | null
  windGusts_10m: (number | null)[] | null
  weatherDescription: (string | null)[] | null
  freezingLevel: (number | null)[] | null
}

export interface WeatherForecastResponse {
  weatherForecasts: WeatherForecastDto[]
  modelNames: string[]
}

export interface HistoricalEstimateDto {
  timestampUtc: string
  location: LocationWithElevation
  dateTimeUtc: (string | null)[] | null
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

export interface HistoricalEstimateResponse {
  estimate: HistoricalEstimateDto
}

export interface WeatherModelDetails {
  agency: string
  countryCode: string | null
  model: string
  label: string
  days: number | null
  resolutionInDeg: number | null
  resolutionInKm: number | null
  sortOrder: number
  modelType: string
}

export interface AvailableModelsResponse {
  models: WeatherModelDetails[]
}
