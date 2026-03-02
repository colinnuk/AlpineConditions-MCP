import { Confidence } from './Confidence'
import { Summary } from './Summary'
import { DangerRating } from './DangerRating'
import { Problem } from './Problem'

export interface Report {
  forecaster: string
  dateIssued: string
  validUntil: string
  title: string
  highlights: string
  confidence: Confidence
  summaries: Summary[]
  dangerRatings: DangerRating[]
  problems: Problem[]
  terrainAndTravelAdvice: string[]
}
