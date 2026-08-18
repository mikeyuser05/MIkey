import { TelemetryBufferPoint } from '../types/telemetry';

export interface TelemetrySummaryReport {
  totalSamples: number;
  avgHeartRate: number;
  maxHeartRate: number;
  minHeartRate: number;
  avgSpo2: number;
  minSpo2: number;
  avgGasPpm: number;
  maxGasPpm: number;
  anomalyCount: number;
  timeRangeStart: string;
  timeRangeEnd: string;
}

export class IntelligenceReportService {
  public static generateSummary(buffer: TelemetryBufferPoint[]): TelemetrySummaryReport | null {
    if (!buffer || buffer.length === 0) return null;

    const totalSamples = buffer.length;
    let sumHr = 0, maxHr = 0, minHr = Infinity;
    let sumSpo2 = 0, minSpo2 = Infinity;
    let sumGas = 0, maxGas = 0;
    let anomalyCount = 0;

    buffer.forEach((pt) => {
      // HR Metrics
      if (pt.heartRate > 0) {
        sumHr += pt.heartRate;
        if (pt.heartRate > maxHr) maxHr = pt.heartRate;
        if (pt.heartRate < minHr) minHr = pt.heartRate;
      }

      // SpO2 Metrics
      if (pt.spo2 > 0) {
        sumSpo2 += pt.spo2;
        if (pt.spo2 < minSpo2) minSpo2 = pt.spo2;
      }

      // Gas Metrics
      if (pt.gasPpm > 0) {
        sumGas += pt.gasPpm;
        if (pt.gasPpm > maxGas) maxGas = pt.gasPpm;
      }

      // Count anomalies
      if (pt.heartRate > 120 || (pt.spo2 > 0 && pt.spo2 < 92) || pt.gasPpm > 300) {
        anomalyCount++;
      }
    });

    return {
      totalSamples,
      avgHeartRate: Math.round(sumHr / (totalSamples || 1)),
      maxHeartRate: maxHr === 0 ? 0 : Math.round(maxHr),
      minHeartRate: minHr === Infinity ? 0 : Math.round(minHr),
      avgSpo2: Math.round(sumSpo2 / (totalSamples || 1)),
      minSpo2: minSpo2 === Infinity ? 0 : Math.round(minSpo2),
      avgGasPpm: Math.round(sumGas / (totalSamples || 1)),
      maxGasPpm: Math.round(maxGas),
      anomalyCount,
      timeRangeStart: new Date(buffer[0].timestamp).toLocaleTimeString(),
      timeRangeEnd: new Date(buffer[buffer.length - 1].timestamp).toLocaleTimeString(),
    };
  }
}