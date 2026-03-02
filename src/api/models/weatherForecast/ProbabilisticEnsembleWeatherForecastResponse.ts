import { LocationWithElevation } from './LocationWithElevation'
import { EnsembleMemberDto } from './EnsembleMemberDto'

export interface ProbabilisticEnsembleWeatherForecastResponse {
  requestedLocation: LocationWithElevation
  weatherModel: string
  timestampUtc: string
  forecastDataDateTimeUtc: string[] | null
  ensembleMembers: EnsembleMemberDto[]
  localTimeZone: string
  forecastDataDateTimeLocal: string[] | null
}
