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
  freezingLevel: (number | null)[] | null
  rainSnowLevel: (number | null)[] | null
}

export interface WeatherForecastResponse {
  weatherForecasts: WeatherForecastDto[]
  modelNames: string[]
}

export interface WeatherModelDetails {
  model: string
  sortOrder: number
}

export interface AvailableModelsResponse {
  models: WeatherModelDetails[]
}
