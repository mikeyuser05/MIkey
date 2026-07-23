/**
 * NOEXCUSE HPO V2 - Contextual Baseline Types
 * Phase PR5.6: Context-Aware Baselines
 */

import { PersonalBaselineState } from './baseline';

export type ActivityContext = 'RESTING' | 'ACTIVE' | 'SLEEPING';

export interface ContextualMultiplier {
  hrUpperMultiplier: number;
  hrLowerMultiplier: number;
  spo2LowerTolerance: number;
}

export interface ContextualizedRanges {
  context: ActivityContext;
  timestamp: number;
  adjustedHrMin: number;
  adjustedHrMax: number;
  adjustedSpo2Min: number;
  adjustedSpo2Max: number;
  adjustedGasMax: number;
}
