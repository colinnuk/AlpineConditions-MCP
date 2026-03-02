import { Elevation } from './Elevation'
import { Aspect } from './Aspect'
import { Likelihood } from './Likelihood'
import { ExpectedSize } from './ExpectedSize'

export interface Data {
  elevations: Elevation[]
  aspects: Aspect[]
  likelihood: Likelihood
  expectedSize: ExpectedSize
}
