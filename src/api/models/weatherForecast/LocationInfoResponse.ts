import { LocationWithElevation } from './LocationWithElevation'

export interface LocationInfoResponse {
  timeZone: string
  location: LocationWithElevation
  name: string | null
}
