/**
 * NOEXCUSE HPO V2 - SQI Deterministic Engine
 * Evaluates telemetry signals against physical constraints, staleness, and spike rules.
 */

import { SQIBoundaryLimits, SQIFlag, SQIEvaluationResult, MetricQualityResult, SQIQualityGrade } from '../../types/sqi';

export const DEFAULT_SQI_BOUNDS: SQIBoundaryLimits = {
  hrMin: 30,
  hrMax: 220,
  hrMaxDeltaPerSec: 15,
  spo2Min: 70,
  spo2Max: 100,
  spo2MaxDeltaPerSec: 5,
  gasMin: 0,
  gasMax: 10000,
  maxStaleAgeMs: 10000, // 10 seconds
};

export interface TelemetryPoint {
  timestamp: number;
  heartRate?: number | null;
  spo2?: number | null;
  gasLevel?: number | null;
  stepCount?: number | null;
}

export class SQIEngine {
  private bounds: SQIBoundaryLimits;

  constructor(bounds: Partial<SQIBoundaryLimits> = {}) {
    this.bounds = { ...DEFAULT_SQI_BOUNDS, ...bounds };
  }

  /**
   * Evaluates a single telemetry sample against physical bounds and previous reference sample.
   */
  public evaluateSample(
    current: TelemetryPoint,
    previous?: TelemetryPoint | null,
    nowMs: number = Date.now()
  ): SQIEvaluationResult {
    const timeDeltaSec = previous ? Math.max((current.timestamp - previous.timestamp) / 1000, 0.1) : 1;
    const packetAgeMs = nowMs - current.timestamp;

    // Check packet freshness
    const isStale = packetAgeMs > this.bounds.maxStaleAgeMs;

    // 1. Evaluate Heart Rate
    const hrQuality = this.evaluateMetric(
      current.heartRate,
      previous?.heartRate,
      this.bounds.hrMin,
      this.bounds.hrMax,
      this.bounds.hrMaxDeltaPerSec,
      timeDeltaSec,
      isStale
    );

    // 2. Evaluate SpO2
    const spo2Quality = this.evaluateMetric(
      current.spo2,
      previous?.spo2,
      this.bounds.spo2Min,
      this.bounds.spo2Max,
      this.bounds.spo2MaxDeltaPerSec,
      timeDeltaSec,
      isStale
    );

    // 3. Evaluate Gas
    const gasQuality = this.evaluateMetric(
      current.gasLevel,
      previous?.gasLevel,
      this.bounds.gasMin,
      this.bounds.gasMax,
      1000, // High threshold for gas changes
      timeDeltaSec,
      isStale
    );

    // 4. Motion Quality Placeholder (based on availability)
    const motionQuality: MetricQualityResult = {
      value: current.stepCount ?? 0,
      isValid: true,
      score: 1.0,
      flags: ['VALID'],
    };

    // Overall Score Calculation (Weighted)
    const overallScore = Number(
      (hrQuality.score * 0.4 + spo2Quality.score * 0.4 + gasQuality.score * 0.2).toFixed(2)
    );

    let grade: SQIQualityGrade = 'EXCELLENT';
    if (overallScore < 0.4) grade = 'INVALID';
    else if (overallScore < 0.7) grade = 'DEGRADED';
    else if (overallScore < 0.9) grade = 'ACCEPTABLE';

    const isUsableForBaselines = overallScore >= 0.70 && hrQuality.isValid && spo2Quality.isValid;

    const summaryReason = this.buildSummaryReason(isStale, hrQuality, spo2Quality, gasQuality);

    return {
      timestamp: current.timestamp,
      overallScore,
      grade,
      isUsableForBaselines,
      heartRateQuality: hrQuality,
      spo2Quality: spo2Quality,
      gasQuality: gasQuality,
      motionQuality,
      summaryReason,
    };
  }

  private evaluateMetric(
    val: number | undefined | null,
    prevVal: number | undefined | null,
    min: number,
    max: number,
    maxDeltaPerSec: number,
    timeDeltaSec: number,
    isStale: boolean
  ): MetricQualityResult {
    const flags: SQIFlag[] = [];

    if (val === undefined || val === null || isNaN(val)) {
      return { value: null, isValid: false, score: 0.0, flags: ['MISSING_DATA'] };
    }

    if (isStale) {
      flags.push('STALE_DATA');
    }

    // Boundary check
    if (val < min || val > max) {
      flags.push('IMPOSSIBLE_VALUE');
      return { value: val, isValid: false, score: 0.0, flags };
    }

    // Spike / Physiological rate-of-change check
    if (prevVal !== undefined && prevVal !== null && !isNaN(prevVal)) {
      const delta = Math.abs(val - prevVal);
      const rateOfChange = delta / timeDeltaSec;

      if (rateOfChange > maxDeltaPerSec) {
        flags.push('PHYSICAL_SPIKE');
        return { value: val, isValid: false, score: 0.3, flags };
      }
    }

    if (flags.length === 0) {
      flags.push('VALID');
      return { value: val, isValid: true, score: 1.0, flags };
    }

    const score = flags.includes('STALE_DATA') ? 0.5 : 0.7;
    return { value: val, isValid: score >= 0.7, score, flags };
  }

  private buildSummaryReason(
    isStale: boolean,
    hr: MetricQualityResult,
    spo2: MetricQualityResult,
    gas: MetricQualityResult
  ): string {
    if (isStale) return 'Telemetry signal is stale.';
    if (!hr.isValid) return `Heart rate data invalid (${hr.flags.join(', ')}).`;
    if (!spo2.isValid) return `SpO2 data invalid (${spo2.flags.join(', ')}).`;
    if (!gas.isValid) return `Gas sensor data invalid (${gas.flags.join(', ')}).`;
    return 'Signal quality meets target baseline thresholds.';
  }
}

export const defaultSQIEngine = new SQIEngine();
