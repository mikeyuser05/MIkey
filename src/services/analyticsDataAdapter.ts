import { ContextualBaselineEngine, BaselineConfig } from '../types/analytics';

export interface TelemetryMetrics {
  heartRate: number;
  spo2: number;
  gas: number;
  timestamp: number;
}

export class AnalyticsDataAdapter {
  private baselineEngine: ContextualBaselineEngine;

  constructor(config?: BaselineConfig) {
    this.baselineEngine = new ContextualBaselineEngine(config);
  }

  public processTelemetry(packet: TelemetryMetrics) {
    const baseline = this.baselineEngine.calculateBaseline(packet.timestamp);
    
    return {
      timestamp: packet.timestamp,
      heartRate: packet.heartRate,
      spo2: packet.spo2,
      gas: packet.gas,
      isHeartRateAnomalous: packet.heartRate < baseline.heartRateMin || packet.heartRate > baseline.heartRateMax,
      isSpo2Anomalous: packet.spo2 < baseline.spo2Min,
      isGasAnomalous: packet.gas > baseline.gasThreshold,
    };
  }
}

export const analyticsAdapter = new AnalyticsDataAdapter();
