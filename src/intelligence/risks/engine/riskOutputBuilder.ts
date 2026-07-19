import { ISingleRiskAssessment, IIntegratedRiskStatus, RiskSeverity } from '../types/risks';
import { calculateOverallSeverity } from './riskSeverity';

/**
 * Pure deterministic builder block that assembles standard risk profiles
 * for consumption by downstream intelligence layers.
 */
export const buildRiskOutput = (
  timestamp: number,
  activeRisks: ISingleRiskAssessment[],
  isAnyRiskTransient: boolean
): IIntegratedRiskStatus => {
  const overallSeverity = calculateOverallSeverity(activeRisks);

  // If no hazards exist, force baseline state definitions
  if (overallSeverity === 'NONE') {
    return {
      timestamp,
      overallSeverity: 'NONE',
      activeRisks: [],
      isTransientSpike: false
    };
  }

  return {
    timestamp,
    overallSeverity,
    activeRisks,
    isTransientSpike: isAnyRiskTransient
  };
};