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

export interface WeatherForecastDto {
  timestampUtc: string
  requestedLocation: LocationWithElevation
  modelLocation: LocationWithElevation
  weatherModel: string
  localTimeZone: string
  geocodedLocation: string | null
  forecastDataDateTimeUtc: (string | null)[] | null
  forecastDataDateTimeLocal: (string | null)[] | null
  temperature_2m: (number | null)[] | null
  precipitation: (number | null)[] | null
  snowfall: (number | null)[] | null
  windSpeed_10m: (number | null)[] | null
  windGusts_10m: (number | null)[] | null
  weatherDescription: (string | null)[] | null
  freezingLevel: (number | null)[] | null
  rainSnowLevel: (number | null)[] | null
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
