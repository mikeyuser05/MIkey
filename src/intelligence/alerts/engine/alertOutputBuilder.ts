import { IAlertPayload, AlertCategory, AlertPriority } from '../types/alerts';

/**
 * Pure deterministic builder block that constructs standard alert payload models.
 * Ensures structural uniformity across telemetry reporting streams without introducing side effects.
 */
export const buildAlertPayload = (
  timestamp: number,
  category: AlertCategory,
  priority: AlertPriority,
  triggerRules: string[],
  telemetryMetrics: { heartRate: number; spo2: number; gas: number },
  currentActivity: string,
  escalationCount: number
): IAlertPayload => {
  // Pure deterministic mapping of input parameters to standard structured output object
  return {
    id: `evt_${category.toLowerCase()}_${timestamp}_${Math.floor(Math.random() * 1000)}`,
    timestamp,
    category,
    priority,
    triggerRules: [...triggerRules],
    metricsSnapshot: {
      heartRate: telemetryMetrics.heartRate,
      spo2: telemetryMetrics.spo2,
      gas: telemetryMetrics.gas
    },
    activitySnapshot: currentActivity,
    escalationCount
  };
};\n