import getHeaders from 'api/getHeaders'
import axios from 'axios'
import { getHostnameForApiCall } from 'utils/HostnameBuilder'

const axiosAvalancheApi = axios.create({
  baseURL: `${getHostnameForApiCall()}/avalancheapi`,
  headers: getHeaders(),
  withCredentials: true
})

export default axiosAvalancheApi
