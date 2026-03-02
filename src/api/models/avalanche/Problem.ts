import { Type } from './Type'
import { Factor } from './Factor'
import { Data } from './Data'

export interface Problem {
  type: Type
  comment: string
  factors: Factor[]
  data: Data
}
