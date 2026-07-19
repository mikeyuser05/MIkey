import { ISingleRiskAssessment, RiskSeverity } from '../types/risks';

/**
 * Pure deterministic multi-sensor fusion processing node.
 * Cross-references metabolic and environmental sensor metrics against directional trends
 * and activity context vectors to deduce complex composite health risks.
 */
export const evaluateCompositeRisks = (
  singleRisks: ISingleRiskAssessment[],
  activityState: { currentActivity: string; confidence: number },
  trendSummary: { heartRate: { direction: string; deltaValue: number }; spo2: { direction: string; deltaValue: number } }
): ISingleRiskAssessment[] => {
  const compositeRisks: ISingleRiskAssessment[] = [];

  const heartRisk = singleRisks.find(r => r.category === 'CARDIOVASCULAR');
  const spo2Risk = singleRisks.find(r => r.category === 'RESPIRATORY');
  const gasRisk = singleRisks.find(r => r.category === 'ENVIRONMENTAL');

  const hrVal = heartRisk ? heartRisk.calculatedValue : 0;
  const o2Val = spo2Risk ? spo2Risk.calculatedValue : 100;

  // 1. Cross-Sensor Fusion Rule: Metabolic Stress Compound
  // High heart rate coupled with falling SpO2 during anaerobic state constraints
  if (hrVal >= 110 && trendSummary.spo2.direction === 'FALLING') {
    compositeRisks.push({
      category: 'COMPOSITE',
      severity: 'HIGH',
      sourceRules: ['METABOLIC_STRESS_COMPOUND_DETECTED'],
      calculatedValue: Number((hrVal / (o2Val || 1)).toFixed(2))
    });
  }

  // 2. Cross-Sensor Fusion Rule: Exertion/Mismatch Compound
  // High cardiovascular metrics in completely static states without step/velocity shifts
  if (hrVal >= 100 && (activityState.currentActivity === 'SITTING' || activityState.currentActivity === 'LYING')) {
    if (activityState.confidence >= 0.8) {
      compositeRisks.push({
        category: 'COMPOSITE',
        severity: 'MEDIUM',
        sourceRules: ['EXERTION_MISMATCH_STATIC_TACHYCARDIA'],
        calculatedValue: hrVal
      });
    }
  }

  // 3. Cross-Sensor Fusion Rule: Environmental Hypoxia Compound
  // High toxic gas detection matched with declining systemic oxygenation profiles
  if (gasRisk && gasRisk.severity !== 'NONE' && trendSummary.spo2.direction === 'FALLING') {
    compositeRisks.push({
      category: 'COMPOSITE',
      severity: 'CRITICAL',
      sourceRules: ['ENVIRONMENTAL_HYPOXIA_COMPOUND_BREACH'],
      calculatedValue: gasRisk.calculatedValue
    });
  }

  return compositeRisks;
};