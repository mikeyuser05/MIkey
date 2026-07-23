/**
 * NOEXCUSE HPO V2 - Predictive Engine Unit Tests
 */

import { PredictiveEngine } from '../services/predictive/predictiveEngine';
import { HealthRiskScoreResult } from '../types/riskScore';
import { ShortTermTrendResult } from '../types/trend';
import { ContextualizedRanges } from '../types/contextualBaseline';

describe('PredictiveEngine', () => {
  let engine: PredictiveEngine;

  beforeEach(() => {
    engine = new PredictiveEngine();
  });

  const mockRiskResult: HealthRiskScoreResult = {
    timestamp: Date.now(),
    userId: 'user_1',
    overallScore: 10,
    riskLevel: 'LOW',
    contributions: {
      heartRate: { metricName: 'Heart Rate', weight: 0.2, rawDeviationScore: 0, weightedScore: 0, severity: 'NORMAL' },
      spo2: { metricName: 'SpO2', weight: 0.45, rawDeviationScore: 0, weightedScore: 0, severity: 'NORMAL' },
      gasLevel: { metricName: 'Gas Level', weight: 0.35, rawDeviationScore: 0, weightedScore: 0, severity: 'NORMAL' },
    },
    dominantRiskFactor: 'None',
    summaryExplanation: 'Normal',
  };

  const mockContextualRanges: ContextualizedRanges = {
    context: 'RESTING',
    timestamp: Date.now(),
    adjustedHrMin: 60,
    adjustedHrMax: 80,
    adjustedSpo2Min: 95,
    adjustedSpo2Max: 100,
    adjustedGasMax: 300,
  };

  it('predicts SpO2 lower boundary breach when dropping rapidly', () => {
    const trendResult: ShortTermTrendResult = {
      timestamp: Date.now(),
      userId: 'user_1',
      windowSizeSeconds: 60,
      heartRateTrend: { metricName: 'Heart Rate', currentValue: 70, velocityPerMinute: 0, accelerationPerMinute: 0, trajectory: 'STABLE', isRapidExcursion: false },
      spo2Trend: { metricName: 'SpO2', currentValue: 97, velocityPerMinute: -4, accelerationPerMinute: 0, trajectory: 'DROPPING_FAST', isRapidExcursion: true },
      gasTrend: { metricName: 'Gas Level', currentValue: 100, velocityPerMinute: 0, accelerationPerMinute: 0, trajectory: 'STABLE', isRapidExcursion: false },
      hasRapidKinematicExcursion: true,
    };

    const warning = engine.generateEarlyWarning(mockRiskResult, trendResult, mockContextualRanges);

    expect(warning.spo2Prediction.willBreachBoundary).toBe(true);
    expect(warning.spo2Prediction.targetBoundary).toBe('LOWER');
    expect(warning.earliestBreachSeconds).toBe(30); // (97 - 95) / 4 min = 0.5 min = 30 sec
    expect(warning.alertLevel).toBe('CRITICAL_PREDICTED');
  });

  it('returns NONE alert level when biometrics are steady', () => {
    const trendResult: ShortTermTrendResult = {
      timestamp: Date.now(),
      userId: 'user_1',
      windowSizeSeconds: 60,
      heartRateTrend: { metricName: 'Heart Rate', currentValue: 72, velocityPerMinute: 0.5, accelerationPerMinute: 0, trajectory: 'STABLE', isRapidExcursion: false },
      spo2Trend: { metricName: 'SpO2', currentValue: 98, velocityPerMinute: 0, accelerationPerMinute: 0, trajectory: 'STABLE', isRapidExcursion: false },
      gasTrend: { metricName: 'Gas Level', currentValue: 110, velocityPerMinute: 0, accelerationPerMinute: 0, trajectory: 'STABLE', isRapidExcursion: false },
      hasRapidKinematicExcursion: false,
    };

    const warning = engine.generateEarlyWarning(mockRiskResult, trendResult, mockContextualRanges);

    expect(warning.alertLevel).toBe('NONE');
    expect(warning.earliestBreachSeconds).toBeNull();
  });
});
