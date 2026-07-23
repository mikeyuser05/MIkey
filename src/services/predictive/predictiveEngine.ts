/**
 * NOEXCUSE HPO V2 - Early-Warning Predictive Anomaly Engine
 * Projects telemetry 5 minutes into the future using velocity & acceleration derivatives
 * to calculate Time-to-Breach horizons and fire early warning alerts.
 */

import { HealthRiskScoreResult } from '../../types/riskScore';
import { ShortTermTrendResult, MetricKinematics } from '../../types/trend';
import { ContextualizedRanges } from '../../types/contextualBaseline';
import { EarlyWarningResult, MetricBreachPrediction, PredictiveAlertLevel } from '../../types/predictive';

export class PredictiveEngine {
  /**
   * Generates early warning predictions based on risk scores, trend kinematics, and contextual bounds.
   */
  public generateEarlyWarning(
    riskResult: HealthRiskScoreResult,
    trendResult: ShortTermTrendResult,
    ranges: ContextualizedRanges
  ): EarlyWarningResult {
    const timestamp = riskResult.timestamp;
    const userId = riskResult.userId;

    const hrPred = this.projectMetric(
      trendResult.heartRateTrend,
      ranges.adjustedHrMin,
      ranges.adjustedHrMax
    );

    const spo2Pred = this.projectMetric(
      trendResult.spo2Trend,
      ranges.adjustedSpo2Min,
      ranges.adjustedSpo2Max
    );

    const gasPred = this.projectMetric(
      trendResult.gasTrend,
      0,
      ranges.adjustedGasMax
    );

    const timeHorizons = [hrPred.timeToBreachSeconds, spo2Pred.timeToBreachSeconds, gasPred.timeToBreachSeconds]
      .filter((t): t is number => t !== null && t > 0);

    const earliestBreachSeconds = timeHorizons.length > 0 ? Math.min(...timeHorizons) : null;
    const alertLevel = this.determineAlertLevel(riskResult.riskLevel, earliestBreachSeconds, trendResult.hasRapidKinematicExcursion);
    const summaryWarning = this.buildWarningSummary(alertLevel, earliestBreachSeconds, [hrPred, spo2Pred, gasPred]);

    return {
      timestamp,
      userId,
      alertLevel,
      hrPrediction: hrPred,
      spo2Prediction: spo2Pred,
      gasPrediction: gasPred,
      earliestBreachSeconds,
      summaryWarning,
    };
  }

  private projectMetric(
    kinematics: MetricKinematics,
    lowerBound: number,
    upperBound: number
  ): MetricBreachPrediction {
    const current = kinematics.currentValue;
    const v = kinematics.velocityPerMinute;
    const a = kinematics.accelerationPerMinute;

    // Kinematic extrapolation equation: x(t) = x0 + v*t + 0.5*a*t^2 (t in minutes)
    const tFutureMin = 5;
    const predictedValue5Min = Number(
      (current + v * tFutureMin + 0.5 * a * Math.pow(tFutureMin, 2)).toFixed(1)
    );

    let willBreachBoundary = false;
    let targetBoundary: 'UPPER' | 'LOWER' | 'NONE' = 'NONE';
    let timeToBreachSeconds: number | null = null;

    if (predictedValue5Min > upperBound && v > 0) {
      willBreachBoundary = true;
      targetBoundary = 'UPPER';
      timeToBreachSeconds = this.solveTimeToBreach(current, upperBound, v, a);
    } else if (predictedValue5Min < lowerBound && v < 0) {
      willBreachBoundary = true;
      targetBoundary = 'LOWER';
      timeToBreachSeconds = this.solveTimeToBreach(current, lowerBound, v, a);
    }

    return {
      metricName: kinematics.metricName,
      predictedValue5Min,
      timeToBreachSeconds,
      willBreachBoundary,
      targetBoundary,
    };
  }

  private solveTimeToBreach(x0: number, xTarget: number, v: number, a: number): number | null {
    const dist = xTarget - x0;
    if (v === 0 && a === 0) return null;

    // First order linear approximation if acceleration is near zero
    if (Math.abs(a) < 0.01) {
      const timeMin = dist / v;
      return timeMin > 0 ? Math.round(timeMin * 60) : null;
    }

    // Quadratic solution: 0.5*a*t^2 + v*t - dist = 0
    const A = 0.5 * a;
    const B = v;
    const C = -dist;
    const discriminant = B * B - 4 * A * C;

    if (discriminant < 0) return null;

    const t1 = (-B + Math.sqrt(discriminant)) / (2 * A);
    const t2 = (-B - Math.sqrt(discriminant)) / (2 * A);

    const validTimes = [t1, t2].filter(t => t > 0);
    if (validTimes.length === 0) return null;

    const minTimeMin = Math.min(...validTimes);
    return Math.round(minTimeMin * 60);
  }

  private determineAlertLevel(
    riskLevel: string,
    earliestBreachSec: number | null,
    hasRapidExcursion: boolean
  ): PredictiveAlertLevel {
    if (riskLevel === 'CRITICAL' || (earliestBreachSec !== null && earliestBreachSec <= 60)) {
      return 'CRITICAL_PREDICTED';
    }
    if (earliestBreachSec !== null && earliestBreachSec <= 300) {
      return 'WARNING';
    }
    if (hasRapidExcursion || riskLevel === 'MODERATE') {
      return 'WATCH';
    }
    return 'NONE';
  }

  private buildWarningSummary(
    level: PredictiveAlertLevel,
    earliestBreachSec: number | null,
    preds: MetricBreachPrediction[]
  ): string {
    if (level === 'NONE') return 'No early warning hazards detected.';
    
    const breaching = preds.filter(p => p.willBreachBoundary);
    const names = breaching.map(b => b.metricName).join(', ') || 'Kinematic trend';

    if (earliestBreachSec !== null) {
      return `[${level}] Projected boundary breach for ${names} in approximately ${earliestBreachSec} seconds.`;
    }
    return `[${level}] Rapid trajectory movement detected for ${names}.`;
  }
}

export const predictiveEngine = new PredictiveEngine();
