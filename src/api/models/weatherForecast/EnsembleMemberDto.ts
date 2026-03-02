import { WeatherDescription } from './WeatherDescription'

export interface EnsembleMemberDto {
  memberId: number
  temperature_2m: (number | null)[] | null
  relativeHumidity_2m: (number | null)[] | null
  dewpoint_2m: (number | null)[] | null
  apparentTemperature: (number | null)[] | null
  precipitation: (number | null)[] | null
  rain: (number | null)[] | null
  snowfall: (number | null)[] | null
  weatherDescription: (WeatherDescription | null)[] | null
  seaLevelPressure: (number | null)[] | null
  surfacePressure: (number | null)[] | null
  cloudCover: (number | null)[] | null
  cloudCoverLow: (number | null)[] | null
  cloudCoverMid: (number | null)[] | null
  cloudCoverHigh: (number | null)[] | null
  visibility: (number | null)[] | null
  windSpeed_10m: (number | null)[] | null
  windDirection_10m: (number | null)[] | null
  freezingLevel: (number | null)[] | null
}
