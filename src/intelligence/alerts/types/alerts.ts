/**
 * NOEXCUSE HPO V2: PR4.5 Alert Decision Domain Types
 */

export type AlertPriority = 'NONE' | 'INFO' | 'WARNING' | 'HIGH' | 'EMERGENCY';

export type AlertCategory = 'HEALTH' | 'ENVIRONMENTAL' | 'SYSTEM';

export interface IAlertPayload {
  id: string;
  timestamp: number;
  category: AlertCategory;
  priority: AlertPriority;
  triggerRules: string[];
  metricsSnapshot: {
    heartRate: number;
    spo2: number;
    gas: number;
  };
  activitySnapshot: string;
  escalationCount: number;
}

export interface IAlertDecisionEngine {
  processAlertEvaluation(
    telemetryMetrics: { heartRate: number; spo2: number; gas: number },
    activityState: { currentActivity: string; confidence: number },
    trendSummary: { heartRate: { direction: string }; spo2: { direction: string } },
    riskStatus: { overallSeverity: string; isTransientSpike: boolean; activeRisks: Array<{ category: string; sourceRules: string[] }> },
    currentTimestamp: number
  ): IAlertPayload | null;
  reset(): void;
}