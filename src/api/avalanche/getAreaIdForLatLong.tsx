import { AreaIdContract } from 'api/models/avalanche/AreaIdContract'
import axiosAvalancheApi from './axiosAvalancheApi'
import buildUrl from 'build-url-ts'

const getAreaIdForLatLong = async (latitude: number, longitude: number) => {
  const url = buildUrl({
    path: 'avalanchebulletin/area-id/location',
    disableCSV: true,
    queryParams: {
      latitude,
      longitude
    }
  })

  if (url === undefined) throw new Error('Failed to build URL')

  const { data } = await axiosAvalancheApi.get<AreaIdContract>(url)
  return data
}

export default getAreaIdForLatLong
