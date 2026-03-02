import { LocationWithElevation } from './LocationWithElevation'
import { WeatherDescription } from './WeatherDescription'

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
  relativeHumidity_2m: (number | null)[] | null
  precipitation: (number | null)[] | null
  cumulativePrecipitation: (number | null)[] | null
  rain: (number | null)[] | null
  cumulativeRain: (number | null)[] | null
  snowfall: (number | null)[] | null
  cumulativeSnowfall: (number | null)[] | null
  snowLiquidRatio: (number | null)[] | null
  cloudCover: (number | null)[] | null
  cloudCoverLow: (number | null)[] | null
  cloudCoverMid: (number | null)[] | null
  cloudCoverHigh: (number | null)[] | null
  visibility: (number | null)[] | null
  windSpeed_10m: (number | null)[] | null
  windDirection_10m: (number | null)[] | null
  windGusts_10m: (number | null)[] | null
  weatherDescription: (WeatherDescription | null)[] | null
  surfacePressure: (number | null)[] | null
  freezingLevel: (number | null)[] | null
  minusTwentyC_Isotherm: (number | null)[] | null
  minusFifteenC_Isotherm: (number | null)[] | null
  minusTenC_Isotherm: (number | null)[] | null
  minusFiveC_Isotherm: (number | null)[] | null
  rainSnowLevel: (number | null)[] | null
  relativeHumidity_1000hPa: (number | null)[] | null
  relativeHumidity_975hPa: (number | null)[] | null
  relativeHumidity_950hPa: (number | null)[] | null
  relativeHumidity_925hPa: (number | null)[] | null
  relativeHumidity_900hPa: (number | null)[] | null
  relativeHumidity_875hPa: (number | null)[] | null
  relativeHumidity_850hPa: (number | null)[] | null
  relativeHumidity_825hPa: (number | null)[] | null
  relativeHumidity_800hPa: (number | null)[] | null
  relativeHumidity_775hPa: (number | null)[] | null
  relativeHumidity_750hPa: (number | null)[] | null
  relativeHumidity_725hPa: (number | null)[] | null
  relativeHumidity_700hPa: (number | null)[] | null
  relativeHumidity_675hPa: (number | null)[] | null
  relativeHumidity_650hPa: (number | null)[] | null
  relativeHumidity_625hPa: (number | null)[] | null
  relativeHumidity_600hPa: (number | null)[] | null
  relativeHumidity_575hPa: (number | null)[] | null
  relativeHumidity_550hPa: (number | null)[] | null
  relativeHumidity_525hPa: (number | null)[] | null
  relativeHumidity_500hPa: (number | null)[] | null
  cloudCover_1000hPa: (number | null)[] | null
  cloudCover_975hPa: (number | null)[] | null
  cloudCover_950hPa: (number | null)[] | null
  cloudCover_925hPa: (number | null)[] | null
  cloudCover_900hPa: (number | null)[] | null
  cloudCover_875hPa: (number | null)[] | null
  cloudCover_850hPa: (number | null)[] | null
  cloudCover_825hPa: (number | null)[] | null
  cloudCover_800hPa: (number | null)[] | null
  cloudCover_775hPa: (number | null)[] | null
  cloudCover_750hPa: (number | null)[] | null
  cloudCover_725hPa: (number | null)[] | null
  cloudCover_700hPa: (number | null)[] | null
  cloudCover_675hPa: (number | null)[] | null
  cloudCover_650hPa: (number | null)[] | null
  cloudCover_625hPa: (number | null)[] | null
  cloudCover_600hPa: (number | null)[] | null
  cloudCover_575hPa: (number | null)[] | null
  cloudCover_550hPa: (number | null)[] | null
  cloudCover_525hPa: (number | null)[] | null
  cloudCover_500hPa: (number | null)[] | null
  windSpeed_1000hPa: (number | null)[] | null
  windSpeed_975hPa: (number | null)[] | null
  windSpeed_950hPa: (number | null)[] | null
  windSpeed_925hPa: (number | null)[] | null
  windSpeed_900hPa: (number | null)[] | null
  windSpeed_850hPa: (number | null)[] | null
  windSpeed_800hPa: (number | null)[] | null
  windSpeed_750hPa: (number | null)[] | null
  windSpeed_700hPa: (number | null)[] | null
  windSpeed_650hPa: (number | null)[] | null
  windSpeed_600hPa: (number | null)[] | null
  windSpeed_550hPa: (number | null)[] | null
  windSpeed_500hPa: (number | null)[] | null
  windDirection_1000hPa: (number | null)[] | null
  windDirection_975hPa: (number | null)[] | null
  windDirection_950hPa: (number | null)[] | null
  windDirection_925hPa: (number | null)[] | null
  windDirection_900hPa: (number | null)[] | null
  windDirection_850hPa: (number | null)[] | null
  windDirection_800hPa: (number | null)[] | null
  windDirection_750hPa: (number | null)[] | null
  windDirection_700hPa: (number | null)[] | null
  windDirection_650hPa: (number | null)[] | null
  windDirection_600hPa: (number | null)[] | null
  windDirection_550hPa: (number | null)[] | null
  windDirection_500hPa: (number | null)[] | null
  shortwaveRadiation: (number | null)[] | null
}
