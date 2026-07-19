import { IRecommendation, IStructuredRecommendationOutput } from '../types/recommendations';

/**
 * Pure deterministic builder block that constructs standard recommendation payloads.
 * Allocates unique identifiers and structural metadata without mutations or side effects.
 */
export const buildRecommendationOutput = (
  timestamp: number,
  recommendations: IRecommendation[]
): IStructuredRecommendationOutput => {
  // Map internal item schemas and inject unique payload structural strings
  const finalizedRecs = recommendations.map(rec => ({
    ...rec,
    id: `rec_${rec.code.toLowerCase()}_${timestamp}`
  }));

  const primaryActionCode = finalizedRecs.length > 0 ? finalizedRecs[0].code : 'REC_NONE';

  return {
    timestamp,
    recommendations: finalizedRecs,
    primaryActionCode
  };
};\n