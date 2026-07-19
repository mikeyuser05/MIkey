import { IRecommendation } from '../types/recommendations';

/**
 * Pure deterministic rule evaluation node.
 * Evaluates core telemetry metrics, activity primitives, trend signs, risk severities,
 * and dispatch payloads to emit standardized recommendation items.
 */
export const evaluateRecommendationRules = (
  telemetryMetrics: { heartRate: number; spo2: number; gas: number },
  activityState: { currentActivity: string; confidence: number },
  trendSummary: { heartRate: { direction: string }; spo2: { direction: string } },
  riskStatus: { overallSeverity: string; isTransientSpike: boolean },
  alertPayload: { priority: string; triggerRules: string[] } | null
): IRecommendation[] => {
  const recommendations: IRecommendation[] = [];

  // Suppress immediate prescriptive recommendations during transient sensor spikes
  if (riskStatus.isTransientSpike) {
    return recommendations;
  }

  // 1. Critical Environmental Gas Breach Rule
  if (telemetryMetrics.gas >= 800 || (alertPayload && alertPayload.triggerRules.includes('CRITICAL_ENVIRONMENTAL_LETHAL_GAS_BREACH'))) {
    recommendations.push({
      id: '',
      code: 'REC_GAS_EVACUATE',
      priority: 'EMERGENCY_ACTION',
      actionItem: 'EVACUATE AREA IMMEDIATELY',
      rationale: 'Critical environmental gas concentration threshold breach detected.'
    });
  }

  // 2. Severe Hypoxia / O2 Saturation Rule
  if (telemetryMetrics.spo2 < 88 || (alertPayload && alertPayload.triggerRules.includes('CRITICAL_HYPOXIA_BREACH'))) {
    recommendations.push({
      id: '',
      code: 'REC_HYPOXIA_EMERGENCY',
      priority: 'EMERGENCY_ACTION',
      actionItem: 'ADMINISTER OXYGEN / SEEK IMMEDIATE MEDICAL ATTENTION',
      rationale: 'Blood oxygen saturation level dropped significantly into critical hypoxia criteria.'
    });
  }

  // 3. Fall Impact Rule
  if (activityState.currentActivity === 'FALL' && activityState.confidence >= 0.75) {
    recommendations.push({
      id: '',
      code: 'REC_FALL_EMERGENCY',
      priority: 'EMERGENCY_ACTION',
      actionItem: 'REMAIN STILL AND WAIT FOR ASSISTANCE',
      rationale: 'High confidence fall profile identified via multi-axis wearable accelerometer vectors.'
    });
  }

  // 4. Cardiovascular/Tachycardia Rest Rule
  if (telemetryMetrics.heartRate > 100 && trendSummary.heartRate.direction === 'RISING') {
    recommendations.push({
      id: '',
      code: 'REC_TACHY_REST',
      priority: 'ACTION_REQUIRED',
      actionItem: 'CEASE ALL STRENUOUS PHYSICAL ACTIVITY AND REST',
      rationale: 'Elevated sustained heart rate displaying continuous upward trending indicators.'
    });
  }

  // 5. Mild Bradycardia Active Warmup Rule
  if (telemetryMetrics.heartRate > 0 && telemetryMetrics.heartRate < 50 && activityState.currentActivity === 'SITTING') {
    recommendations.push({
      id: '',
      code: 'REC_BRADY_WARMUP',
      priority: 'PREVENTIVE',
      actionItem: 'PERFORM LIGHT MOVEMENT OR STANDING WARMUP',
      rationale: 'Low resting heart rate detected during extended period of sedentary sitting state.'
    });
  }

  // 6. Routine Hydration Baseline Check
  if (riskStatus.overallSeverity === 'NONE' && activityState.currentActivity === 'RUNNING') {
    recommendations.push({
      id: '',
      code: 'REC_HYDRATION_CHECK',
      priority: 'INFO',
      actionItem: 'MAINTAIN CONCURRENT FLUID INTAKE',
      rationale: 'Routine preventive hydration guidance for active high-intensity running blocks.'
    });
  }

  return recommendations;
};\n