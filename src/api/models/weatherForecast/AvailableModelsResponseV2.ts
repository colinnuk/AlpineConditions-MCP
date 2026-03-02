import { WeatherModelDetailsContract } from './WeatherModelDetailsContract'

export interface AvailableModelsResponseV2 {
  models: WeatherModelDetailsContract[]
  latitude: number | null
  longitude: number | null
}
