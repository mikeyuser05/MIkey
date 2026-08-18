import { TelemetryBufferPoint, AnomalyIndicator } from '../types/telemetry';

export class AnalyticsEngine {
  private static HR_HIGH_THRESHOLD = 120; // BPM
  private static SPO2_LOW_THRESHOLD = 92;  // %
  private static GAS_HIGH_THRESHOLD = 300; // PPM

  private static hrHighStart: number | null = null;
  private static spo2LowStart: number | null = null;
  private static gasHighStart: number | null = null;

  /**
   * Evaluates persistent anomalies over time.
   * NOTE: Anomaly indicators are purely informative for visual analytics.
   * Emergency safety gating is strictly maintained separately by PR26 Emergency Service.
   */
  public static evaluateTrends(buffer: TelemetryBufferPoint[]): AnomalyIndicator[] {
    const anomalies: AnomalyIndicator[] = [];
    if (buffer.length === 0) return anomalies;

    const latest = buffer[buffer.length - 1];

    // 1. Persistent High Heart Rate Evaluation
    if (latest.heartRate > this.HR_HIGH_THRESHOLD) {
      if (!this.hrHighStart) this.hrHighStart = latest.timestamp;
      const durationSec = Math.floor((latest.timestamp - this.hrHighStart) / 1000);
      if (durationSec >= 10) {
        anomalies.push({
          id: 'hr-high-persistent',
          metric: 'heartRate',
          severity: latest.heartRate > 140 ? 'CRITICAL' : 'WARNING',
          message: `Persistent High HR (${latest.heartRate} BPM)`,
          durationSeconds: durationSec,
          timestamp: latest.timestamp,
        });
      }
    } else {
      this.hrHighStart = null;
    }

    // 2. Persistent Low SpO2 Evaluation
    if (latest.spo2 > 0 && latest.spo2 < this.SPO2_LOW_THRESHOLD) {
      if (!this.spo2LowStart) this.spo2LowStart = latest.timestamp;
      const durationSec = Math.floor((latest.timestamp - this.spo2LowStart) / 1000);
      if (durationSec >= 8) {
        anomalies.push({
          id: 'spo2-low-persistent',
          metric: 'spo2',
          severity: latest.spo2 < 88 ? 'CRITICAL' : 'WARNING',
          message: `Persistent Low Oxygen Saturation (${latest.spo2}%)`,
          durationSeconds: durationSec,
          timestamp: latest.timestamp,
        });
      }
    } else {
      this.spo2LowStart = null;
    }

    // 3. Persistent Environmental Gas Elevation
    if (latest.gasPpm > this.GAS_HIGH_THRESHOLD) {
      if (!this.gasHighStart) this.gasHighStart = latest.timestamp;
      const durationSec = Math.floor((latest.timestamp - this.gasHighStart) / 1000);
      if (durationSec >= 5) {
        anomalies.push({
          id: 'gas-high-persistent',
          metric: 'gasPpm',
          severity: latest.gasPpm > 600 ? 'CRITICAL' : 'WARNING',
          message: `Hazardous Gas Level Detected (${latest.gasPpm} PPM)`,
          durationSeconds: durationSec,
          timestamp: latest.timestamp,
        });
      }
    } else {
      this.gasHighStart = null;
    }

    return anomalies;
  }
}
