import { Issuer } from './Issuer'

export interface AreaIdContract {
  areaId: string
  latitude: number
  longitude: number
  issuer: Issuer
  timestampUtc: string
}
