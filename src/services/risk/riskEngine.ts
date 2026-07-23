/**
 * NOEXCUSE HPO V2 - Multi-Sensor Health Risk Scoring Engine
 * Blends real-time individual biometrics and ambient deviations into a unified 0-100 risk score.
 */

import { PersonalDeviationState, MetricDeviationResult, DeviationSeverity } from '../../types/deviation';
import { HealthRiskScoreResult, MetricRiskContribution, OverallRiskLevel } from '../../types/riskScore';

export class HealthRiskEngine {
  // Clinical weights: SpO2 hypoxemia > Gas toxicity > Heart rate strain
  private static WEIGHTS = {
    spo2: 0.45,
    gasLevel: 0.35,
    heartRate: 0.20,
  };

  /**
   * Calculates a composite health risk score from individual deviation states.
   */
  public calculateRiskScore(deviationState: PersonalDeviationState): HealthRiskScoreResult {
    const { timestamp, userId, heartRateDeviation, spo2Deviation, gasDeviation } = deviationState;

    const hrContrib = this.computeMetricContribution('Heart Rate', heartRateDeviation, HealthRiskEngine.WEIGHTS.heartRate);
    const spo2Contrib = this.computeMetricContribution('SpO2', spo2Deviation, HealthRiskEngine.WEIGHTS.spo2);
    const gasContrib = this.computeMetricContribution('Gas Level', gasDeviation, HealthRiskEngine.WEIGHTS.gasLevel);

    const rawTotal = hrContrib.weightedScore + spo2Contrib.weightedScore + gasContrib.weightedScore;
    const overallScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

    const riskLevel = this.determineRiskLevel(overallScore);
    const dominantRiskFactor = this.findDominantRiskFactor([hrContrib, spo2Contrib, gasContrib]);
    const summaryExplanation = this.buildSummary(overallScore, riskLevel, dominantRiskFactor);

    return {
      timestamp,
      userId,
      overallScore,
      riskLevel,
      contributions: {
        heartRate: hrContrib,
        spo2: spo2Contrib,
        gasLevel: gasContrib,
      },
      dominantRiskFactor,
      summaryExplanation,
    };
  }

  private computeMetricContribution(
    metricName: string,
    dev: MetricDeviationResult,
    weight: number
  ): MetricRiskContribution {
    const rawDeviationScore = this.severityToScore(dev.severity, dev.deltaFromBoundary);
    const weightedScore = Number((rawDeviationScore * weight).toFixed(2));

    return {
      metricName,
      weight,
      rawDeviationScore,
      weightedScore,
      severity: dev.severity,
    };
  }

  private severityToScore(severity: DeviationSeverity, deltaFromBoundary: number): number {
    switch (severity) {
      case 'CRITICAL_DEVIATION':
        return Math.min(100, 80 + deltaFromBoundary * 2);
      case 'MODERATE_DEVIATION':
        return Math.min(79, 45 + deltaFromBoundary * 1.5);
      case 'MILD_DEVIATION':
        return Math.min(44, 15 + deltaFromBoundary * 1.0);
      case 'NORMAL':
      default:
        return 0;
    }
  }

  private determineRiskLevel(score: number): OverallRiskLevel {
    if (score >= 75) return 'CRITICAL';
    if (score >= 45) return 'HIGH';
    if (score >= 20) return 'MODERATE';
    return 'LOW';
  }

  private findDominantRiskFactor(contributions: MetricRiskContribution[]): string {
    const sorted = [...contributions].sort((a, b) => b.weightedScore - a.weightedScore);
    if (sorted[0].weightedScore === 0) return 'None';
    return sorted[0].metricName;
  }

  private buildSummary(score: number, level: OverallRiskLevel, dominantFactor: string): string {
    if (level === 'LOW') {
      return 'All biometrics and environmental signals are operating within healthy parameters.';
    }
    return `Overall Health Risk is ${level} (Score: ${score}/100). Primary driver: ${dominantFactor}.`;
  }
}

export const healthRiskEngine = new HealthRiskEngine();
