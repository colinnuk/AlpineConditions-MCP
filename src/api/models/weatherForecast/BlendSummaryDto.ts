import { WeatherForecastDto } from './WeatherForecastDto'

export interface BlendSummaryDto {
  blend: WeatherForecastDto
  min: WeatherForecastDto
  max: WeatherForecastDto
  percentile25: WeatherForecastDto
  percentile75: WeatherForecastDto
  constituentModels: string[]
}
