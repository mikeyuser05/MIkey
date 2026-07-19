import { RecommendationPriority } from '../types/recommendations';

export interface IRecommendationConfig {
  cooldownPeriodsMs: Record<string, number>;
  priorityWeights: Record<RecommendationPriority, number>;
}

export const DEFAULT_RECOMMENDATION_CONFIG: IRecommendationConfig = {
  cooldownPeriodsMs: {
    'REC_HYPOXIA_EMERGENCY': 10000,
    'REC_FALL_EMERGENCY': 5000,
    'REC_TACHY_REST': 30000,
    'REC_GAS_EVACUATE': 10000,
    'REC_BRADY_WARMUP': 45000,
    'REC_HYDRATION_CHECK': 60000,
  },
  priorityWeights: {
    'INFO': 1,
    'PREVENTIVE': 2,
    'ACTION_REQUIRED': 3,
    'EMERGENCY_ACTION': 4
  }
};\n