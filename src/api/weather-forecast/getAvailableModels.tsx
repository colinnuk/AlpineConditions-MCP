import axiosWeatherForecastApi from './axiosWeatherForecastApi'
import { buildUrl } from 'build-url-ts'
import { AvailableModelsResponseV2 } from 'api/models/weatherForecast/AvailableModelsResponseV2'

const getAvailableModels = async (latitude?: number, longitude?: number) => {
  const url = buildUrl({
    path: '/location/available-models-v2',
    disableCSV: true,
    queryParams: {
      latitude,
      longitude
    }
  })

  if (url === undefined) throw new Error('Failed to build URL')

  const { data } = await axiosWeatherForecastApi.get<AvailableModelsResponseV2>(url)
  return data
}

export const queryKey: string = 'availableModels-all'

export default getAvailableModels
