import { WeatherForecastDto } from './WeatherForecastDto'

export interface CustomEnsembleSummaryDto {
  mean: WeatherForecastDto | null
  median: WeatherForecastDto | null
  min: WeatherForecastDto
  max: WeatherForecastDto
  percentile25: WeatherForecastDto | null
  percentile75: WeatherForecastDto | null
  constituentModels: string[]
}
