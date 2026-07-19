import { IRecommendation } from '../types/recommendations';
import { IRecommendationConfig } from '../config/recommendationConfig';

/**
 * Pure deterministic conflict resolution node.
 * Evaluates mutually exclusive actions (e.g., EVACUATE vs REMAIN STILL) 
 * and drops lower-priority conflicting items based on priority weight matrices.
 */
export const resolveRecommendationConflicts = (
  rankedRecommendations: IRecommendation[],
  config: IRecommendationConfig
): IRecommendation[] => {
  if (rankedRecommendations.length <= 1) {
    return rankedRecommendations;
  }

  const resolved: IRecommendation[] = [];
  let hasEvacuation = false;
  let hasImmobilityCommand = false;

  // Scan for mutually exclusive operational protocols
  for (const rec of rankedRecommendations) {
    if (rec.code === 'REC_GAS_EVACUATE') {
      hasEvacuation = true;
    }
    if (rec.code === 'REC_FALL_EMERGENCY') {
      hasImmobilityCommand = true;
    }
  }

  // Conflict Resolution Rule Matrix Rule 1: Evacuation takes absolute precedence over remaining still
  for (const rec of rankedRecommendations) {
    if (hasEvacuation && hasImmobilityCommand && rec.code === 'REC_FALL_EMERGENCY') {
      // Drop fall immobility instruction in favor of high-priority environmental evacuation gas protocol
      continue;
    }
    
    // Add non-conflicting or winner item to clean array
    resolved.push(rec);
  }

  return resolved;
};\n