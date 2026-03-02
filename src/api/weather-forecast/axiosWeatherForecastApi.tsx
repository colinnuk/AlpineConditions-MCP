import getHeaders from 'api/getHeaders'
import axios from 'axios'
import { getHostnameForApiCall } from 'utils/HostnameBuilder'

const axiosWeatherForecastApi = axios.create({
  baseURL: `${getHostnameForApiCall()}/weatherforecastapi`,
  headers: getHeaders(),
  withCredentials: true
})

export default axiosWeatherForecastApi
