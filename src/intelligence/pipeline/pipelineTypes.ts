/**
 * NOEXCUSE HPO V2: PR4.11.2 Pipeline Integration Structural Typing
 * Establishes explicit boundaries across sequential transformation nodes.
 */

export interface IRawTelemetryFrame {
  deviceId: string;
  timestamp: number;
  heartRate: number;
  spo2: number;
  gasConcentration: number;
  rawAcceleration: { x: number; y: number; z: number };
}

export interface IPipelineState {
  healthState: {
    heartRateStatus: string;
    spo2Status: string;
    gasSafetyStatus: string;
    isSafe: boolean;
  };
  activityState: {
    currentActivity: 'RESTING' | 'ACTIVE' | 'HIGH_INTENSITY' | 'UNKNOWN';
    confidenceScore: number;
  };
  alertState: {
    isTriggered: boolean;
    criticality: 'NONE' | 'LOW' | 'MEDIUM' | 'CRITICAL';
    message: string;
  };
  recommendations: {
    primaryActionCode: string;
    items: Array<{ priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; actionItem: string; rationale: string }>;
  };
  explainableData: {
    targetRecommendationCode: string;
    underlyingDirectives: string[];
    systemLogicJustification: string;
  };
  dailySummary: {
    timestamp: number;
    averageHeartRate: number;
    minimumSpO2: number;
    totalActiveMinutes: number;
    riskFactorAssessment: string;
  };
  weeklySummary: {
    intervalId: string;
    complianceScore: number;
    operationalAnomalyCount: number;
    insights: string[];
  };
  monthlySummary: {
    intervalId: string;
    overallWellnessIndex: number;
    systemicDriftIdentified: boolean;
    recommendationsSummary: string;
  };
  aiPrompt: {
    compiledPayload: string;
    generatedAt: number;
  };
  reportMetadata: {
    pipelineExecutionTimeMs: number;
    lastProcessedTimestamp: number;
  };
}\n