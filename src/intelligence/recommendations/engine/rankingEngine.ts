import { IRecommendation, RecommendationPriority } from '../types/recommendations';
import { IRecommendationConfig } from '../config/recommendationConfig';

/**
 * Pure deterministic prioritization node.
 * Ranks recommendation items using strict configuration weights.
 */
export const rankRecommendations = (
  recommendations: IRecommendation[],
  config: IRecommendationConfig
): IRecommendation[] => {
  if (recommendations.length <= 1) {
    return [...recommendations];
  }

  return [...recommendations].sort((a, b) => {
    const weightA = config.priorityWeights[a.priority] || 0;
    const weightB = config.priorityWeights[b.priority] || 0;
    
    // Sort in descending order of priority weight
    return weightB - weightA;
  });
};