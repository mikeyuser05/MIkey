import { AlertCategory } from '../types/alerts';

export interface IEvaluationResult {
  isEligible: boolean;
  category: AlertCategory;
  triggerRules: string[];
}

/**
 * Pure deterministic calculation node determining alert eligibility.
 * Evaluates unified conditions using risk engine states, structural activity context,
 * and sensor metrics. Transient spikes or stable/safe parameters yield no alert eligibility.
 */
export const evaluateAlertRules = (
  telemetryMetrics: { heartRate: number; spo2: number; gas: number },
  activityState: { currentActivity: string; confidence: number },
  riskStatus: { overallSeverity: string; isTransientSpike: boolean; activeRisks: Array<{ category: string; sourceRules: string[] }> }
): IEvaluationResult => {
  const triggerRules: string[] = [];
  let category: AlertCategory = 'SYSTEM';

  // Transient spikes are instantly choked from triggering downstream alerts
  if (riskStatus.isTransientSpike || riskStatus.overallSeverity === 'NONE') {
    return { isEligible: false, category, triggerRules };
  }

  // 1. Environmental Hazard Rules (Highest priority infrastructure risk)
  const hasEnvironmentalRisk = riskStatus.activeRisks.some(r => r.category === 'ENVIRONMENTAL' || r.sourceRules.includes('ENVIRONMENTAL_HYPOXIA_COMPOUND_BREACH'));
  if (hasEnvironmentalRisk || telemetryMetrics.gas >= 400) {
    category = 'ENVIRONMENTAL';
    if (telemetryMetrics.gas >= 800) {
      triggerRules.push('CRITICAL_ENVIRONMENTAL_LETHAL_GAS_BREACH');
    } else {
      triggerRules.push('SUSTAINED_HAZARDOUS_GAS_EXPOSURE');
    }
  }

  // 2. Physiological/Health Rules
  const hasHealthRisk = riskStatus.activeRisks.some(r => r.category === 'CARDIOVASCULAR' || r.category === 'RESPIRATORY' || r.category === 'COMPOSITE');
  if (hasHealthRisk) {
    if (category !== 'ENVIRONMENTAL') {
      category = 'HEALTH';
    }

    // Map exact rule tracking indicators
    riskStatus.activeRisks.forEach(risk => {
      risk.sourceRules.forEach(rule => {
        if (!triggerRules.includes(rule)) {
          triggerRules.push(rule);
        }
      });
    });
  }

  // 3. Fall Detection Cross-Reference
  if (activityState.currentActivity === 'FALL' && activityState.confidence >= 0.75) {
    category = 'HEALTH';
    triggerRules.push('DETERMINISTIC_FALL_IMPACT_VERIFIED');
  }

  return {
    isEligible: triggerRules.length > 0,
    category,
    triggerRules
  };
};\n