/**
 * NOEXCUSE HPO V2: PR4.4 Health Risk Detection Domain Types
 */

export type RiskSeverity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskCategory = 'CARDIOVASCULAR' | 'RESPIRATORY' | 'ENVIRONMENTAL' | 'COMPOSITE';

export interface ISingleRiskAssessment {
  category: RiskCategory;
  severity: RiskSeverity;
  sourceRules: string[];
  calculatedValue: number;
}

export interface IIntegratedRiskStatus {
  timestamp: number;
  overallSeverity: RiskSeverity;
  activeRisks: ISingleRiskAssessment[];
  isTransientSpike: boolean;
}

export interface IHealthRiskEngine {
  evaluateHealthRisks(
    telemetryMetrics: { heartRate: number; spo2: number; gas: number },
    activityState: { currentActivity: string; confidence: number },
    trendSummary: { heartRate: { direction: string; deltaValue: number }; spo2: { direction: string; deltaValue: number } }
  ): IIntegratedRiskStatus;
  reset(): void;
}\n