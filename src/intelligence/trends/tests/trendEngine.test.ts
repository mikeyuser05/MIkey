import { TrendAnalysisEngine } from '../engine/trendAnalysisEngine';
import { calculateRollingStats } from '../engine/rollingStats';
import { calculateActivityDurations } from '../engine/activityDuration';
import { compileDailyMetrics } from '../engine/dailyMetrics';
import { ITrendConfig } from '../config/trendConfig';
import { UserActivity } from '../../activity/types/activity';
import { describe, beforeEach, test, expect } from 'vitest';
describe('PR4.3 Trend Analysis Engine - Automated Test Suite', () => {
  let engine: TrendAnalysisEngine;

  const mockConfig: ITrendConfig = {
    minDataPointsForTrend: 4,
    significantDeltas: {
      heartRate: 5.0,
      spo2: 1.0,
      gas: 50.0,
    },
    trendWindowSizeMs: 60000, // 1 minute narrow testing scope
  };

  beforeEach(() => {
    engine = new TrendAnalysisEngine(mockConfig);
  });

  test('Rolling Statistics: Correctly calculates min, max, and numerical averages', () => {
    const telemetryHistory = [
      { heartRate: 60, spo2: 98, gas: 100 },
      { heartRate: 70, spo2: 96, gas: 150 },
      { heartRate: 80, spo2: 94, gas: 200 },
    ];

    const stats = calculateRollingStats(telemetryHistory);

    expect(stats.heartRate).toEqual({ min: 60, max: 80, avg: 70 });
    expect(stats.spo2).toEqual({ min: 94, max: 98, avg: 96 });
    expect(stats.gas).toEqual({ min: 100, max: 200, avg: 150 });
  });

  test('Activity Duration: Integrates state logs chronologically into precise millisecond totals', () => {
    const startTime = 1000000;
    const activityHistory: { timestamp: number; currentActivity: UserActivity }[] = [
      { timestamp: startTime, currentActivity: 'SITTING' },
      { timestamp: startTime + 5000, currentActivity: 'SITTING' }, // 5000ms sitting
      { timestamp: startTime + 15000, currentActivity: 'WALKING' }, // 10000ms sitting
      { timestamp: startTime + 18000, currentActivity: 'RUNNING' }, // 3000ms walking
    ];

    const durationMetrics = calculateActivityDurations(activityHistory);

    expect(durationMetrics.activityDurationsMs['SITTING']).toBe(15000);
    expect(durationMetrics.activityDurationsMs['WALKING']).toBe(3000);
    expect(durationMetrics.totalTrackedTimeMs).toBe(18000);
  });

  test('Trend Detection: Correctly extracts vector direction changes across historical splits', () => {
    const baseTime = Date.now();
    
    // Gradual upward incline to pass delta threshold (+5.0)
    const telemetryHistory = [
      { timestamp: baseTime - 4000, heartRate: 60, spo2: 98, gas: 100 },
      { timestamp: baseTime - 3000, heartRate: 61, spo2: 98, gas: 100 },
      { timestamp: baseTime - 2000, heartRate: 72, spo2: 98, gas: 100 },
      { timestamp: baseTime - 1000, heartRate: 74, spo2: 98, gas: 100 },
    ];

    const activityHistory = [
      { timestamp: baseTime - 4000, currentActivity: 'SITTING' as UserActivity }
    ];

    const analysis = engine.processTrendWindow(telemetryHistory, activityHistory);

    expect(analysis.trends.heartRate.direction).toBe('RISING');
    expect(analysis.trends.spo2.direction).toBe('STABLE');
  });

  test('Daily Metrics: Compiles functional statistics and identifies dominant activity configuration', () => {
    const rollingMetrics = {
      heartRate: { min: 60, max: 120, avg: 85 },
      spo2: { min: 95, max: 99, avg: 97 },
      gas: { min: 100, max: 300, avg: 150 },
    };

    const activityMetrics = {
      activityDurationsMs: {
        UNKNOWN: 0,
        STANDING: 1000,
        SITTING: 10000, // Dominant state
        LYING: 0,
        WALKING: 4000,
        RUNNING: 2000,
        FALL: 0,
        NO_MOVEMENT: 0,
      },
      totalTrackedTimeMs: 17000,
    };

    const dailySummary = compileDailyMetrics('2026-07-18', rollingMetrics, activityMetrics);

    expect(dailySummary.dateKey).toBe('2026-07-18');
    expect(dailySummary.dominantActivity).toBe('SITTING');
    expect(dailySummary.maxHeartRate).toBe(120);
    expect(dailySummary.totalActiveTimeMs).toBe(6000); // WALKING (4000) + RUNNING (2000)
  });
});