import axiosWeatherForecastApi from './axiosWeatherForecastApi'
import { WeatherForecastResponseModel } from '../models/weatherForecast/WeatherForecastResponseModel'
import { buildUrl } from 'build-url-ts'

const getWeatherForecast = async (latitude: number, longitude: number, models: string[]) => {
  const url = buildUrl({
    path: '/weatherForecast',
    disableCSV: true,
    queryParams: {
      latitude,
      longitude,
      weatherModels: models
    }
  })

  if (url === undefined) throw new Error('Failed to build URL')

  if (models.length === 0) {
    return Promise.resolve({
      weatherForecasts: [],
      modelNames: [],
      customEnsembleSummary: null,
      blendSummary: null
    } as WeatherForecastResponseModel)
  }

  const { data } = await axiosWeatherForecastApi.get<WeatherForecastResponseModel>(url)
  return data
}

export default getWeatherForecast
