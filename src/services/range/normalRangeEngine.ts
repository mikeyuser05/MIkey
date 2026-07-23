/**
 * NOEXCUSE HPO V2 - Individual Normal Range Engine
 * Computes individual upper and lower bounds by blending stated profile baselines
 * with statistically established telemetry baselines.
 */

import { PersonalHealthProfile } from '../../types/profile';
import { PersonalBaselineState } from '../../types/baseline';
import { PersonalNormalRanges, SingleMetricRange } from '../../types/normalRange';

export class NormalRangeEngine {
  /**
   * Computes individual normal ranges for heart rate, SpO2, and gas levels.
   */
  public computeRanges(
    profile: PersonalHealthProfile,
    baseline: PersonalBaselineState
  ): PersonalNormalRanges {
    const now = Date.now();

    const hrRange = this.computeHeartRateRange(profile, baseline);
    const spo2Range = this.computeSpo2Range(profile, baseline);
    const gasRange = this.computeGasRange(baseline);

    return {
      userId: profile.id || baseline.userId,
      calculatedAt: now,
      confidence: baseline.confidence,
      heartRateRange: hrRange,
      spo2Range,
      gasRange,
    };
  }

  private computeHeartRateRange(
    profile: PersonalHealthProfile,
    baseline: PersonalBaselineState
  ): SingleMetricRange {
    const stated = profile.statedBaselines;
    const stats = baseline.restingHeartRate;

    // Fallback if baseline sample count is too low (< 30 samples)
    if (stats.sampleCount < 30 || baseline.confidence === 'LOW') {
      return {
        lowerBound: stated.expectedRestingHrMin,
        upperBound: stated.expectedRestingHrMax,
        targetMean: Number(((stated.expectedRestingHrMin + stated.expectedRestingHrMax) / 2).toFixed(1)),
        toleranceMargin: Number(((stated.expectedRestingHrMax - stated.expectedRestingHrMin) / 2).toFixed(1)),
        isStatedProfileFallback: true,
      };
    }

    // Blend standard deviation with stated limits (2 * stdDev window)
    const stdMargin = Math.max(stats.stdDev * 2, 5);
    const lower = Math.max(Math.round(stats.mean - stdMargin), 30);
    const upper = Math.min(Math.round(stats.mean + stdMargin), 220);

    return {
      lowerBound: lower,
      upperBound: upper,
      targetMean: stats.mean,
      toleranceMargin: Number(stdMargin.toFixed(1)),
      isStatedProfileFallback: false,
    };
  }

  private computeSpo2Range(
    profile: PersonalHealthProfile,
    baseline: PersonalBaselineState
  ): SingleMetricRange {
    const stated = profile.statedBaselines;
    const stats = baseline.baselineSpo2;

    if (stats.sampleCount < 30 || baseline.confidence === 'LOW') {
      return {
        lowerBound: stated.expectedBaselineSpo2Min,
        upperBound: stated.expectedBaselineSpo2Max,
        targetMean: Number(((stated.expectedBaselineSpo2Min + stated.expectedBaselineSpo2Max) / 2).toFixed(1)),
        toleranceMargin: Number(((stated.expectedBaselineSpo2Max - stated.expectedBaselineSpo2Min) / 2).toFixed(1)),
        isStatedProfileFallback: true,
      };
    }

    const lower = Math.max(Math.round(stats.mean - Math.max(stats.stdDev * 2, 2)), 70);
    const upper = 100;

    return {
      lowerBound: lower,
      upperBound: upper,
      targetMean: stats.mean,
      toleranceMargin: Number((upper - lower).toFixed(1)),
      isStatedProfileFallback: false,
    };
  }

  private computeGasRange(baseline: PersonalBaselineState): SingleMetricRange {
    const stats = baseline.baselineGasLevel;

    if (stats.sampleCount < 30) {
      return {
        lowerBound: 0,
        upperBound: 400, // Default safe PPM boundary
        targetMean: 100,
        toleranceMargin: 300,
        isStatedProfileFallback: true,
      };
    }

    const upper = Math.max(Math.round(stats.mean + Math.max(stats.stdDev * 3, 50)), 300);

    return {
      lowerBound: 0,
      upperBound: upper,
      targetMean: stats.mean,
      toleranceMargin: upper,
      isStatedProfileFallback: false,
    };
  }
}

export const normalRangeEngine = new NormalRangeEngine();
