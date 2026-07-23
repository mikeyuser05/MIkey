/**
 * @file normalRangeEngine.ts
 * @description Deterministic range calculation engine.
 * Computes personalized vital bands based on personal profiles and empirical baseline data.
 */

import { PersonalHealthProfile } from '../../types/healthProfile';
import { EmpiricBaselineResult } from '../../types/baselineEngine';
import { PersonalNormalRanges } from '../../types/normalRange';

// Physiological Safety Limits
const ABSOLUTE_MIN_RHR = 40;
const ABSOLUTE_MAX_RHR = 120;
const ABSOLUTE_MIN_SPO2 = 88;
const ABSOLUTE_MAX_SPO2 = 100;

export class NormalRangeEngine {
  /**
   * Computes individual target ranges for a given user profile and baseline empirical result.
   */
  public static calculateRanges(
    profile: PersonalHealthProfile,
    empirical?: EmpiricBaselineResult | null
  ): PersonalNormalRanges {
    const isCalibrated = empirical ? empirical.isCalibrated : false;

    // 1. Determine Target Resting HR
    const targetRHR = isCalibrated && empirical
      ? empirical.empiricalRHR
      : profile.baselines.restingHeartRate;

    // 2. Determine HR Deviation Margin (use 1.5 * stdDev if calibrated, default +/- 10 BPM)
    const hrMargin = isCalibrated && empirical && empirical.hrStdDev > 0
      ? Math.max(6, Math.min(20, Math.round(1.5 * empirical.hrStdDev)))
      : 10;

    let hrRestingLower = Math.max(ABSOLUTE_MIN_RHR, targetRHR - hrMargin);
    let hrRestingUpper = Math.min(ABSOLUTE_MAX_RHR, targetRHR + hrMargin);

    // Apply manual profile overrides if explicitly supplied
    if (profile.baselines.customHRLowerBound !== undefined) {
      hrRestingLower = profile.baselines.customHRLowerBound;
    }
    if (profile.baselines.customHRUpperBound !== undefined) {
      hrRestingUpper = profile.baselines.customHRUpperBound;
    }

    // 3. Active HR Upper ceiling (60% to 85% of Tanaka HR max)
    const maxHR = profile.baselines.maxHeartRate;
    const activeLower = Math.round(maxHR * 0.5);
    const activeUpper = Math.round(maxHR * 0.85);

    // 4. Determine SpO2 Band
    const targetSpO2 = isCalibrated && empirical
      ? empirical.empiricalSpO2
      : profile.baselines.restingSpO2;

    const spO2Margin = isCalibrated && empirical && empirical.spO2StdDev > 0
      ? Math.max(2, Math.min(5, Math.round(2.0 * empirical.spO2StdDev)))
      : 3;

    const spO2Lower = Math.max(ABSOLUTE_MIN_SPO2, Math.round(targetSpO2 - spO2Margin));
    const spO2Upper = ABSOLUTE_MAX_SPO2;

    return {
      heartRateResting: {
        lower: hrRestingLower,
        upper: hrRestingUpper,
        target: targetRHR,
      },
      heartRateActive: {
        lower: activeLower,
        upper: activeUpper,
        target: Math.round(maxHR * 0.70),
      },
      spO2Resting: {
        lower: spO2Lower,
        upper: spO2Upper,
        target: targetSpO2,
      },
      isEmpiricallyDerived: isCalibrated,
      derivedAtIso: new Date().toISOString(),
    };
  }
}
