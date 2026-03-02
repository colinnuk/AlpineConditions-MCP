import getHeaders from 'api/getHeaders'
import { GeolocationModel } from 'api/models/geolocation/GeolocationModel'
import axios from 'axios'
import { getHostnameForApiCall } from 'utils/HostnameBuilder'

const axiosGeolocationApi = axios.create({
  baseURL: getHostnameForApiCall(),
  headers: getHeaders(),
  withCredentials: true
})

const getGeolocationData = async () => {
  const { data } = await axiosGeolocationApi.get<GeolocationModel>('geolocation')
  return data
}

export default getGeolocationData
