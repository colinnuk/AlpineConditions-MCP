import axiosWeatherForecastApi from './axiosWeatherForecastApi'
import { buildUrl } from 'build-url-ts'
import { LocationInfoResponse } from '../models/weatherForecast/LocationInfoResponse'

const getLocationInfo = async (latitude: number, longitude: number) => {
  const url = buildUrl({
    path: '/location',
    disableCSV: true,
    queryParams: {
      latitude,
      longitude
    }
  })

  if (url === undefined) throw new Error('Failed to build URL')

  const { data } = await axiosWeatherForecastApi.get<LocationInfoResponse>(url)
  return data
}

export default getLocationInfo
