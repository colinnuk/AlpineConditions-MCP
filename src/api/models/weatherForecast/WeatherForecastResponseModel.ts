import { WeatherForecastDto } from './WeatherForecastDto'
import { CustomEnsembleSummaryDto } from './CustomEnsembleSummaryDto'
import { BlendSummaryDto } from './BlendSummaryDto'

export interface WeatherForecastResponseModel {
  weatherForecasts: WeatherForecastDto[]
  modelNames: string[]
  customEnsembleSummary: CustomEnsembleSummaryDto | null
  blendSummary: BlendSummaryDto | null
}
