import { ISingleRiskAssessment, RiskSeverity } from '../types/risks';

/**
 * Pure deterministic prioritization node.
 * Maps array blocks of isolated and composite risk metrics to the absolute highest
 * severity indicator present in the structural matrix.
 */
export const calculateOverallSeverity = (
  activeRisks: ISingleRiskAssessment[]
): RiskSeverity => {
  if (!activeRisks || activeRisks.length === 0) {
    return 'NONE';
  }

  // Weight map assignments for deterministic escalation priority mapping
  const severityWeights: Record<RiskSeverity, number> = {
    'NONE': 0,
    'LOW': 1,
    'MEDIUM': 2,
    'HIGH': 3,
    'CRITICAL': 4
  };

  let maxWeight = 0;
  let highestSeverity: RiskSeverity = 'NONE';

  for (let i = 0; i < activeRisks.length; i++) {
    const risk = activeRisks[i];
    const weight = severityWeights[risk.severity] || 0;

    if (weight > maxWeight) {
      maxWeight = weight;
      highestSeverity = risk.severity;
    }
  }

  return highestSeverity;
};\n