import { Issuer } from './Issuer'
import { Area } from './Area'
import { Report } from './Report'
import { Owner } from './Owner'

export interface AvalancheBulletin {
  id: string
  url: string
  issuer: Issuer
  area: Area
  report: Report
  owner: Owner
}
