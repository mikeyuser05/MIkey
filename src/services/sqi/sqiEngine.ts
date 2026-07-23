/**
 * @file sqiEngine.ts
 * @description Deterministic Signal Quality Index (SQI) validator.
 */

import { TelemetryReadingInput, SQIEvaluationResult, SQIFailureReason } from '../../types/sqi';

const MAX_STALE_AGE_MS = 15000;
const HR_MIN_VALID = 30;
const HR_MAX_VALID = 240;
const SPO2_MIN_VALID = 60;
const SPO2_MAX_VALID = 100;

const MAX_HR_DELTA_PER_SEC = 20;
const MAX_SPO2_DROP_PER_SEC = 5;

export class SQIEngine {
  public static evaluate(
    current: TelemetryReadingInput,
    previous?: TelemetryReadingInput | null,
    nowMs: number = Date.now()
  ): SQIEvaluationResult {
    const flags: SQIFailureReason[] = [];
    let score = 100;

    if (current.heartRate === null || current.heartRate === undefined || current.spO2 === null || current.spO2 === undefined) {
      flags.push('MISSING_DATA');
      return {
        grade: 'INVALID',
        score: 0,
        isValidForBaseline: false,
        flags,
        evaluatedAtMs: nowMs,
      };
    }

    const ageMs = nowMs - current.timestampMs;
    if (ageMs > MAX_STALE_AGE_MS || current.timestampMs <= 0) {
      flags.push('STALE_DATA');
      score -= 40;
    }

    if (current.heartRate < HR_MIN_VALID || current.heartRate > HR_MAX_VALID) {
      flags.push('HR_OUT_OF_PHYSIOLOGICAL_RANGE');
      score -= 50;
    }

    if (current.spO2 < SPO2_MIN_VALID || current.spO2 > SPO2_MAX_VALID) {
      flags.push('SPO2_OUT_OF_PHYSIOLOGICAL_RANGE');
      score -= 50;
    }

    if (previous && previous.timestampMs > 0 && previous.heartRate != null && previous.spO2 != null) {
      const dtSec = Math.max(0.1, (current.timestampMs - previous.timestampMs) / 1000);

      const hrDelta = Math.abs(current.heartRate - previous.heartRate);
      if (hrDelta / dtSec > MAX_HR_DELTA_PER_SEC) {
        flags.push('IMPLAUSIBLE_HR_SPIKE');
        score -= 30;
      }

      const spO2Drop = previous.spO2 - current.spO2;
      if (spO2Drop / dtSec > MAX_SPO2_DROP_PER_SEC) {
        flags.push('IMPLAUSIBLE_SPO2_DROP');
        score -= 30;
      }
    }

    if (current.accelMagnitude && current.accelMagnitude > 3.5) {
      flags.push('HIGH_MOTION_ARTIFACT');
      score -= 20;
    }

    score = Math.max(0, score);
    let grade: 'EXCELLENT' | 'ACCEPTABLE' | 'DEGRADED' | 'INVALID';

    if (score >= 90) {
      grade = 'EXCELLENT';
    } else if (score >= 70) {
      grade = 'ACCEPTABLE';
    } else if (score >= 40) {
      grade = 'DEGRADED';
    } else {
      grade = 'INVALID';
    }

    const isValidForBaseline = (grade === 'EXCELLENT' || grade === 'ACCEPTABLE') && !flags.includes('HR_OUT_OF_PHYSIOLOGICAL_RANGE') && !flags.includes('SPO2_OUT_OF_PHYSIOLOGICAL_RANGE');

    return {
      grade,
      score,
      isValidForBaseline,
      flags,
      evaluatedAtMs: nowMs,
    };
  }
}
