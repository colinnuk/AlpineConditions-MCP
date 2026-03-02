import axiosAvalancheApi from './axiosAvalancheApi'
import { AvalancheBulletin } from 'api/models/avalanche/AvalancheBulletin'

const getBulletinForAreaId = async (areaId: string) => {
  const { data } = await axiosAvalancheApi.get<AvalancheBulletin>(`avalanchebulletin/area/${areaId}`)
  return data
}

export default getBulletinForAreaId
