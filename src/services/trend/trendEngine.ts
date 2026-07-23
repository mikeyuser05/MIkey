/**
 * NOEXCUSE HPO V2 - Short-Term Trend & Acceleration Analysis Engine
 * Evaluates rolling buffer history to compute 1st and 2nd derivatives of biometric telemetry.
 */

import { ValidatedTelemetryPacket } from '../sqi/sqiFilter';
import { MetricKinematics, MetricTrendTrajectory, ShortTermTrendResult } from '../../types/trend';

export class TrendEngine {
  private bufferMap: Map<string, ValidatedTelemetryPacket[]> = new Map();
  private maxBufferAgeMs: number = 5 * 60 * 1000; // 5 minutes rolling history

  /**
   * Processes an incoming telemetry packet and computes rate of change & acceleration.
   */
  public analyzeTrend(
    userId: string,
    packet: ValidatedTelemetryPacket
  ): ShortTermTrendResult {
    const timestamp = packet.raw.timestamp;

    // Maintain sliding window buffer
    let buffer = this.bufferMap.get(userId) || [];
    buffer.push(packet);
    buffer = buffer.filter(p => timestamp - p.raw.timestamp <= this.maxBufferAgeMs);
    this.bufferMap.set(userId, buffer);

    const hrTrend = this.calculateKinematics('Heart Rate', buffer, p => p.raw.heartRate, 15, 30);
    const spo2Trend = this.calculateKinematics('SpO2', buffer, p => p.raw.spo2, -2, -4);
    const gasTrend = this.calculateKinematics('Gas Level', buffer, p => p.raw.gasLevel, 25, 50);

    const hasRapidKinematicExcursion =
      hrTrend.isRapidExcursion || spo2Trend.isRapidExcursion || gasTrend.isRapidExcursion;

    return {
      timestamp,
      userId,
      windowSizeSeconds: Math.round((buffer[buffer.length - 1].raw.timestamp - buffer[0].raw.timestamp) / 1000),
      heartRateTrend: hrTrend,
      spo2Trend,
      gasTrend,
      hasRapidKinematicExcursion,
    };
  }

  private calculateKinematics(
    metricName: string,
    buffer: ValidatedTelemetryPacket[],
    extractor: (p: ValidatedTelemetryPacket) => number | null | undefined,
    fastRiseThreshold: number,
    criticalVelocityThreshold: number
  ): MetricKinematics {
    const validSamples = buffer
      .map(p => ({ time: p.raw.timestamp / 1000, val: extractor(p) }))
      .filter((s): s is { time: number; val: number } => s.val !== null && s.val !== undefined && !isNaN(s.val));

    if (validSamples.length < 2) {
      const current = validSamples.length === 1 ? validSamples[0].val : 0;
      return {
        metricName,
        currentValue: current,
        velocityPerMinute: 0,
        accelerationPerMinute: 0,
        trajectory: 'STABLE',
        isRapidExcursion: false,
      };
    }

    const latest = validSamples[validSamples.length - 1];
    const earliest = validSamples[0];
    const timeDeltaMin = (latest.time - earliest.time) / 60;

    if (timeDeltaMin <= 0) {
      return {
        metricName,
        currentValue: latest.val,
        velocityPerMinute: 0,
        accelerationPerMinute: 0,
        trajectory: 'STABLE',
        isRapidExcursion: false,
      };
    }

    // 1st Derivative: Velocity (Change per minute)
    const velocityPerMinute = Number(((latest.val - earliest.val) / timeDeltaMin).toFixed(2));

    // 2nd Derivative: Acceleration (Velocity rate of change over mid-point)
    const midIndex = Math.floor(validSamples.length / 2);
    const midSample = validSamples[midIndex];
    const firstHalfDelta = (midSample.time - earliest.time) / 60;
    const secondHalfDelta = (latest.time - midSample.time) / 60;

    let accel = 0;
    if (firstHalfDelta > 0 && secondHalfDelta > 0) {
      const v1 = (midSample.val - earliest.val) / firstHalfDelta;
      const v2 = (latest.val - midSample.val) / secondHalfDelta;
      accel = (v2 - v1) / ((latest.time - earliest.time) / 120);
    }
    const accelerationPerMinute = Number(accel.toFixed(2));

    const trajectory = this.determineTrajectory(velocityPerMinute, fastRiseThreshold);
    const isRapidExcursion = Math.abs(velocityPerMinute) >= Math.abs(criticalVelocityThreshold);

    return {
      metricName,
      currentValue: latest.val,
      velocityPerMinute,
      accelerationPerMinute,
      trajectory,
      isRapidExcursion,
    };
  }

  private determineTrajectory(velocity: number, threshold: number): MetricTrendTrajectory {
    if (velocity >= Math.abs(threshold)) return 'RISING_FAST';
    if (velocity > 2) return 'RISING_SLOW';
    if (velocity <= -Math.abs(threshold)) return 'DROPPING_FAST';
    if (velocity < -2) return 'DROPPING_SLOW';
    return 'STABLE';
  }

  public resetUserBuffer(userId: string): void {
    this.bufferMap.delete(userId);
  }
}

export const trendEngine = new TrendEngine();
