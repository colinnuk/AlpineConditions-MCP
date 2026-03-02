import { WeatherModelType } from './WeatherModelType'

export interface WeatherModelDetailsContract {
  agency: string
  countryCode: string | null
  model: string
  label: string
  chartColour: string
  days: number | null
  resolutionInDeg: number | null
  resolutionInKm: number | null
  sortOrder: number
  modelType: WeatherModelType
}
