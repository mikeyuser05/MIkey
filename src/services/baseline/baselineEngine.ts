/**
 * NOEXCUSE HPO V2 - Baseline Collection Engine
 * Deterministic statistical computation for personal health baselines.
 * Only accepts SQI-validated telemetry samples.
 */

import { MetricBaselineStats, PersonalBaselineState, BaselineConfidence } from '../../types/baseline';
import { ValidatedTelemetryPacket } from '../sqi/sqiFilter';

export interface BaselineEngineConfig {
  minSamplesForModerateConfidence: number; // e.g. 30 samples
  minSamplesForHighConfidence: number;     // e.g. 100 samples
  minSamplesForEstablishedConfidence: number; // e.g. 300 samples
}

export const DEFAULT_BASELINE_CONFIG: BaselineEngineConfig = {
  minSamplesForModerateConfidence: 30,
  minSamplesForHighConfidence: 100,
  minSamplesForEstablishedConfidence: 300,
};

export class BaselineEngine {
  private config: BaselineEngineConfig;

  constructor(config: Partial<BaselineEngineConfig> = {}) {
    this.config = { ...DEFAULT_BASELINE_CONFIG, ...config };
  }

  /**
   * Initializes an empty baseline state for a given user.
   */
  public createEmptyState(userId: string = 'default_user'): PersonalBaselineState {
    const now = Date.now();
    const emptyStats: MetricBaselineStats = {
      sampleCount: 0,
      mean: 0,
      stdDev: 0,
      median: 0,
      minObserved: 0,
      maxObserved: 0,
      lastUpdated: now,
    };

    return {
      userId,
      updatedAt: now,
      confidence: 'LOW',
      overallConfidenceScore: 0.0,
      restingHeartRate: { ...emptyStats },
      baselineSpo2: { ...emptyStats },
      baselineGasLevel: { ...emptyStats },
      windowStartTimestamp: now,
      windowEndTimestamp: now,
    };
  }

  /**
   * Accumulates a set of SQI-validated telemetry packets into an existing baseline state.
   * Rejects any packet where sqi.isUsableForBaselines is false.
   */
  public accumulateBatch(
    currentState: PersonalBaselineState,
    packets: ValidatedTelemetryPacket[]
  ): PersonalBaselineState {
    const validPackets = packets.filter(p => p.sqi.isValidForBaseline);

    if (validPackets.length === 0) {
      return currentState;
    }

    const hrValues = validPackets
      .map(p => p.raw.heartRate)
      .filter((v): v is number => v !== null && v !== undefined);

    const spo2Values = validPackets
      .map(p => p.raw.spO2)
      .filter((v): v is number => v !== null && v !== undefined);

    const gasValues = validPackets
      .map(p => p.raw.gasLevel?? 0)
      .filter((v): v is number => v !== null && v !== undefined);

    const now = Date.now();
    const updatedHr = this.updateMetricStats(currentState.restingHeartRate, hrValues, now);
    const updatedSpo2 = this.updateMetricStats(currentState.baselineSpo2, spo2Values, now);
    const updatedGas = this.updateMetricStats(currentState.baselineGasLevel, gasValues, now);

    const totalValidSamples = updatedHr.sampleCount;
    const { confidence, confidenceScore } = this.calculateConfidence(totalValidSamples);

    const timestamps = validPackets.map(p => p.raw.timestampMs);
    const minTime = Math.min(...timestamps, currentState.windowStartTimestamp || now);
    const maxTime = Math.max(...timestamps, currentState.windowEndTimestamp || now);

    return {
      ...currentState,
      updatedAt: now,
      confidence,
      overallConfidenceScore: confidenceScore,
      restingHeartRate: updatedHr,
      baselineSpo2: updatedSpo2,
      baselineGasLevel: updatedGas,
      windowStartTimestamp: minTime,
      windowEndTimestamp: maxTime,
    };
  }

  /**
   * Computes incremental mean, stdDev, min, max for a set of new values.
   */
  private updateMetricStats(
    existing: MetricBaselineStats,
    newValues: number[],
    now: number
  ): MetricBaselineStats {
    if (newValues.length === 0) return existing;

    const allValues = newValues.sort((a, b) => a - b);
    const newCount = newValues.length;
    const totalCount = existing.sampleCount + newCount;

    // Combined Mean Calculation
    const sumNew = newValues.reduce((acc, v) => acc + v, 0);
    const newMean = (existing.mean * existing.sampleCount + sumNew) / totalCount;

    // Standard Deviation Calculation
    let sumSqDiff = existing.sampleCount * Math.pow(existing.stdDev, 2);
    for (const val of newValues) {
      sumSqDiff += Math.pow(val - newMean, 2);
    }
    const newStdDev = totalCount > 1 ? Math.sqrt(sumSqDiff / totalCount) : 0;

    // Min and Max update
    const minObs = existing.sampleCount === 0 ? allValues[0] : Math.min(existing.minObserved, allValues[0]);
    const maxObs = existing.sampleCount === 0 ? allValues[allValues.length - 1] : Math.max(existing.maxObserved, allValues[allValues.length - 1]);

    // Simple Median Approximation
    const medianObs = allValues[Math.floor(allValues.length / 2)];

    return {
      sampleCount: totalCount,
      mean: Number(newMean.toFixed(2)),
      stdDev: Number(newStdDev.toFixed(2)),
      median: existing.sampleCount === 0 ? medianObs : Number(((existing.median + medianObs) / 2).toFixed(2)),
      minObserved: minObs,
      maxObserved: maxObs,
      lastUpdated: now,
    };
  }

  private calculateConfidence(sampleCount: number): { confidence: BaselineConfidence; confidenceScore: number } {
    if (sampleCount >= this.config.minSamplesForEstablishedConfidence) {
      return { confidence: 'ESTABLISHED', confidenceScore: 1.0 };
    }
    if (sampleCount >= this.config.minSamplesForHighConfidence) {
      const score = 0.75 + 0.25 * ((sampleCount - this.config.minSamplesForHighConfidence) / (this.config.minSamplesForEstablishedConfidence - this.config.minSamplesForHighConfidence));
      return { confidence: 'HIGH', confidenceScore: Number(score.toFixed(2)) };
    }
    if (sampleCount >= this.config.minSamplesForModerateConfidence) {
      const score = 0.40 + 0.35 * ((sampleCount - this.config.minSamplesForModerateConfidence) / (this.config.minSamplesForHighConfidence - this.config.minSamplesForModerateConfidence));
      return { confidence: 'MODERATE', confidenceScore: Number(score.toFixed(2)) };
    }

    const score = 0.40 * (sampleCount / this.config.minSamplesForModerateConfidence);
    return { confidence: 'LOW', confidenceScore: Number(score.toFixed(2)) };
  }
}

export const defaultBaselineEngine = new BaselineEngine();
