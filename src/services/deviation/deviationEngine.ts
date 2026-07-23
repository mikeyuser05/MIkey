/**
 * NOEXCUSE HPO V2 - Personal Deviation Detection Engine
 * Compares SQI-validated live telemetry against personal normal ranges (PR5.4)
 * to evaluate individual physiological deviations.
 */

import { PersonalNormalRanges, SingleMetricRange } from '../../types/normalRange';
import { ValidatedTelemetryPacket } from '../sqi/sqiFilter';
import { PersonalDeviationState, MetricDeviationResult, DeviationSeverity } from '../../types/deviation';

export class DeviationEngine {
  /**
   * Evaluates a single validated telemetry packet against personal normal ranges.
   */
  public evaluateDeviation(
    packet: ValidatedTelemetryPacket,
    ranges: PersonalNormalRanges
  ): PersonalDeviationState {
    const timestamp = packet.raw.timestamp;
    const userId = ranges.userId;

    const hrDev = this.evaluateMetricDeviation(
      packet.raw.heartRate,
      ranges.heartRateRange,
      'Heart Rate',
      'bpm'
    );

    const spo2Dev = this.evaluateMetricDeviation(
      packet.raw.spo2,
      ranges.spo2Range,
      'SpO2',
      '%'
    );

    const gasDev = this.evaluateMetricDeviation(
      packet.raw.gasLevel,
      ranges.gasRange,
      'Gas PPM',
      'ppm'
    );

    const severities: DeviationSeverity[] = [hrDev.severity, spo2Dev.severity, gasDev.severity];
    const maxSeverity = this.getHighestSeverity(severities);
    const hasAnyDeviation = maxSeverity !== 'NORMAL';

    return {
      timestamp,
      userId,
      heartRateDeviation: hrDev,
      spo2Deviation: spo2Dev,
      gasDeviation: gasDev,
      hasAnyDeviation,
      maxSeverity,
    };
  }

  private evaluateMetricDeviation(
    val: number | null | undefined,
    range: SingleMetricRange,
    metricName: string,
    unit: string
  ): MetricDeviationResult {
    if (val === null || val === undefined || isNaN(val)) {
      return {
        currentValue: null,
        baselineMean: range.targetMean,
        lowerBound: range.lowerBound,
        upperBound: range.upperBound,
        deltaFromMean: 0,
        deltaFromBoundary: 0,
        severity: 'NORMAL',
        isAboveNormal: false,
        isBelowNormal: false,
        explanation: `${metricName} data missing or invalid.`,
      };
    }

    const deltaFromMean = Number((val - range.targetMean).toFixed(1));
    const isAboveNormal = val > range.upperBound;
    const isBelowNormal = val < range.lowerBound;

    let deltaFromBoundary = 0;
    if (isAboveNormal) deltaFromBoundary = Number((val - range.upperBound).toFixed(1));
    if (isBelowNormal) deltaFromBoundary = Number((range.lowerBound - val).toFixed(1));

    const severity = this.calculateSeverity(val, range);
    const explanation = this.buildExplanation(metricName, val, range, unit, severity);

    return {
      currentValue: val,
      baselineMean: range.targetMean,
      lowerBound: range.lowerBound,
      upperBound: range.upperBound,
      deltaFromMean,
      deltaFromBoundary,
      severity,
      isAboveNormal,
      isBelowNormal,
      explanation,
    };
  }

  private calculateSeverity(val: number, range: SingleMetricRange): DeviationSeverity {
    if (val >= range.lowerBound && val <= range.upperBound) {
      return 'NORMAL';
    }

    const margin = Math.max(range.toleranceMargin, 1);
    const distancePastLimit = val > range.upperBound ? val - range.upperBound : range.lowerBound - val;
    const relativeExcursion = distancePastLimit / margin;

    if (relativeExcursion > 1.5) return 'CRITICAL_DEVIATION';
    if (relativeExcursion > 0.5) return 'MODERATE_DEVIATION';
    return 'MILD_DEVIATION';
  }

  private getHighestSeverity(severities: DeviationSeverity[]): DeviationSeverity {
    if (severities.includes('CRITICAL_DEVIATION')) return 'CRITICAL_DEVIATION';
    if (severities.includes('MODERATE_DEVIATION')) return 'MODERATE_DEVIATION';
    if (severities.includes('MILD_DEVIATION')) return 'MILD_DEVIATION';
    return 'NORMAL';
  }

  private buildExplanation(
    metricName: string,
    val: number,
    range: SingleMetricRange,
    unit: string,
    severity: DeviationSeverity
  ): string {
    if (severity === 'NORMAL') {
      return `${metricName} (${val}${unit}) is within your normal range (${range.lowerBound}-${range.upperBound}${unit}).`;
    }
    const direction = val > range.upperBound ? 'above' : 'below';
    const limit = val > range.upperBound ? range.upperBound : range.lowerBound;
    const diff = Math.abs(val - limit).toFixed(1);

    return `${metricName} (${val}${unit}) is ${diff}${unit} ${direction} your personal boundary limit of ${limit}${unit} [${severity}].`;
  }
}

export const deviationEngine = new DeviationEngine();
