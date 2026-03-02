import { WeatherModelDetails } from '../types/alpineConditions.js'

export interface ModelGuidanceEntry {
  model: string
  label: string
  modelType: string
  countryCode: string | null
  resolutionInKm: number | null
  forecastDays: number | null
  isHighResolution: boolean
  guidance: string
}

export interface LocationModelGuidance {
  planningHeuristics: {
    shortRange: string
    mediumRange: string
    uncertainty: string
    blendUsage: string
  }
  blendModelAvailable: boolean
  highResolutionModelsAvailable: ModelGuidanceEntry[]
  availableModels: ModelGuidanceEntry[]
}

const HIGH_RESOLUTION_KM_THRESHOLD = 5

const bySortOrder = (a: WeatherModelDetails, b: WeatherModelDetails) => a.sortOrder - b.sortOrder

const isSingleModel = (model: WeatherModelDetails) => model.modelType === 'Single'

const isHighResolution = (model: WeatherModelDetails): boolean => {
  return model.resolutionInKm !== null && model.resolutionInKm <= HIGH_RESOLUTION_KM_THRESHOLD
}

const getGuidanceText = (model: WeatherModelDetails): string => {
  const name = model.model.toLowerCase()

  if (name === 'blend') {
    return 'Alpine Conditions Blend combines multiple agency models for a quick baseline. Use it with individual models when risk is high.'
  }
  if (name.includes('hrrr')) {
    return 'HRRR-type models are high-resolution and best for short-range mountain planning.'
  }
  if (name.includes('arome') || name.includes('hrdps') || name.includes('swiss')) {
    return 'High-resolution regional model. Prioritize for near-term terrain-sensitive conditions in covered regions.'
  }
  if (name.includes('ecmwf')) {
    return 'ECMWF-family models are typically strong for medium-range synoptic patterns.'
  }
  if (name.includes('gfs') || name.includes('iconglobal') || name.includes('global')) {
    return 'Global model useful for broader trend confidence and medium-range planning.'
  }
  if (isHighResolution(model)) {
    return 'High-resolution model suitable for short-range mountain detail where geographically available.'
  }

  return 'Use this model in cross-model comparisons to estimate uncertainty and timing spread.'
}

const toGuidanceEntry = (model: WeatherModelDetails): ModelGuidanceEntry => ({
  model: model.model,
  label: model.label,
  modelType: model.modelType,
  countryCode: model.countryCode,
  resolutionInKm: model.resolutionInKm,
  forecastDays: model.days,
  isHighResolution: isHighResolution(model),
  guidance: getGuidanceText(model)
})

export const chooseDefaultForecastModels = (availableModels: WeatherModelDetails[]): string[] => {
  const ordered = [...availableModels].sort(bySortOrder)
  const singleModels = ordered.filter(isSingleModel)
  const highResSingles = singleModels.filter(isHighResolution)
  const defaultSingles = singleModels.length > 0 ? singleModels : ordered

  const picked: WeatherModelDetails[] = []

  // Prefer up to two high-resolution single models when present.
  for (const model of highResSingles) {
    if (picked.length >= 2) break
    picked.push(model)
  }

  // Add best available non-high-res single model for broader context.
  for (const model of defaultSingles) {
    if (picked.some((pickedModel) => pickedModel.model === model.model)) continue
    picked.push(model)
    if (picked.length >= 3) break
  }

  return picked.map((model) => model.model)
}

export const buildLocationModelGuidance = (availableModels: WeatherModelDetails[]): LocationModelGuidance => {
  const available = [...availableModels].sort(bySortOrder).map(toGuidanceEntry)
  const highResolutionModels = available.filter((model) => model.isHighResolution)
  const blendModelAvailable = available.some((model) => model.model.toLowerCase() === 'blend')

  return {
    planningHeuristics: {
      shortRange: 'For 0-48 hours, prioritize high-resolution regional models available for this location.',
      mediumRange: 'For 3-7 days, use global models like ECMWF/GFS/ICON Global to assess broader trends.',
      uncertainty: 'Compare multiple models. Agreement increases confidence; large spread indicates uncertainty.',
      blendUsage: 'Use Blend as a quick overview, then inspect individual models when decisions are high-consequence.'
    },
    blendModelAvailable,
    highResolutionModelsAvailable: highResolutionModels,
    availableModels: available
  }
}

export const buildSelectedModelGuidance = (
  availableModels: WeatherModelDetails[],
  selectedModels: string[]
): ModelGuidanceEntry[] => {
  const indexed = new Map(availableModels.map((model) => [model.model, model]))

  return selectedModels.map((modelName) => {
    const model = indexed.get(modelName)
    if (!model) {
      return {
        model: modelName,
        label: modelName,
        modelType: 'Unknown',
        countryCode: null,
        resolutionInKm: null,
        forecastDays: null,
        isHighResolution: false,
        guidance: 'Model not listed in available models for this location.'
      }
    }
    return toGuidanceEntry(model)
  })
}
