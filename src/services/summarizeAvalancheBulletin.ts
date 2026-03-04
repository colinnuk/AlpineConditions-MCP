import { AvalancheBulletinResponse, AvalancheDangerRatingSet, AvalancheNamedValue } from '../types/alpineConditions.js'

const stripHtml = (input: string | null | undefined): string | null => {
  if (!input) return null
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const normalizeNamedValue = (value: AvalancheNamedValue | null | undefined): { value: string; display: string } | null => {
  if (!value) return null
  return {
    value: value.value,
    display: value.display
  }
}

const mapDangerLevel = (
  level:
    | {
        display: string
        rating: AvalancheNamedValue | null
      }
    | undefined
) => {
  if (!level) return null
  return {
    band: level.display,
    rating: normalizeNamedValue(level.rating)
  }
}

const mapDangerByElevation = (ratings: AvalancheDangerRatingSet) => {
  return {
    alpine: mapDangerLevel(ratings.alp),
    treeline: mapDangerLevel(ratings.tln),
    belowTreeline: mapDangerLevel(ratings.btl)
  }
}

export const summarizeAvalancheBulletin = (bulletin: AvalancheBulletinResponse) => {
  const report = bulletin.report
  const highlights = stripHtml(report.highlights)

  const avalancheSummary = report.summaries.find((summary) => summary.type.value === 'avalanche-summary')
  const snowpackSummary = report.summaries.find((summary) => summary.type.value === 'snowpack-summary')

  return {
    topLevelSummary: {
      areaName: report.title ?? bulletin.area.name,
      dateIssuedUtc: report.dateIssued,
      validUntilUtc: report.validUntil,
      highlights,
      avalancheSummary: stripHtml(avalancheSummary?.content),
      snowpackSummary: stripHtml(snowpackSummary?.content),
      travelAdvice: report.terrainAndTravelAdvice
    },
    dangerLevelsByDay: report.dangerRatings.map((item) => ({
      dateUtc: item.date,
      byElevation: mapDangerByElevation(item.ratings)
    })),
    problems: report.problems.map((problem) => ({
      type: normalizeNamedValue(problem.type),
      details: stripHtml(problem.comment),
      aspects: (problem.data?.aspects ?? []).map((aspect) => normalizeNamedValue(aspect)).filter(Boolean),
      elevations: (problem.data?.elevations ?? []).map((elevation) => normalizeNamedValue(elevation)).filter(Boolean),
      likelihood: normalizeNamedValue(problem.data?.likelihood),
      expectedSize: {
        min: problem.data?.expectedSize?.min ?? null,
        max: problem.data?.expectedSize?.max ?? null
      }
    })),
    confidence: {
      score: normalizeNamedValue(report.confidence?.rating),
      statements: report.confidence?.statements ?? []
    }
  }
}
