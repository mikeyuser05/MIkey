import { ReportEngine } from '../engine/reportEngine';
import { aggregateHistoricalMetrics } from '../engine/historicalMetricsAggregator';
import { calculateAggregatedHealthScores } from '../engine/healthScoreAggregator';
import { serializeReport, deserializeReport } from '../engine/reportSerializer';
import { IReportConfig } from '../config/reportConfig';
import { IPeriodicReport } from '../types/reports';
import { describe, beforeEach, test, expect } from 'vitest';
describe('PR4.7 Periodic AI Reports - Automated Test Suite', () => {
  let reportEngine: ReportEngine;

  const mockConfig: IReportConfig = {
    minDataPointsRequired: {
      'WEEKLY': 3,  // Lowered bounds exclusively for granular unit testing coverage
      'MONTHLY': 5
    },
    criticalGasThreshold: 800,
    criticalSpo2Threshold: 88
  };

  // Generate clean mocked daily data points
  const generateMockDailySummaries = (count: number, baselineHR = 72, baselineSpo2 = 96, baselineGas = 120) => {
    return Array.from({ length: count }, (_, i) => ({
      timestamp: 1710000000000 + i * 86400000,
      metricsSnapshot: { heartRate: baselineHR, spo2: baselineSpo2, gas: baselineGas },
      healthScore: 90,
      alertCount: 0,
      riskCategories: []
    }));
  };

  beforeEach(() => {
    reportEngine = new ReportEngine(mockConfig);
  });

  test('Data Validation: Rejects evaluation processing when daily summaries fall below configuration requirements', () => {
    const insufficientData = generateMockDailySummaries(2); // Requires 3 for WEEKLY in mockConfig
    
    expect(() => {
      reportEngine.generatePeriodicReport('WEEKLY', insufficientData, 1710000000000, 1710172800000);
    }).toThrow('Insufficient data blocks to evaluate weekly report context.');
  });

  test('Historical Metrics Aggregator: Accurately parses ranges and produces clean mathematical averages', () => {
    const mixedData = [
      { metricsSnapshot: { heartRate: 60, spo2: 98, gas: 100 } },
      { metricsSnapshot: { heartRate: 80, spo2: 94, gas: 200 } },
      { metricsSnapshot: { heartRate: 70, spo2: 96, gas: 150 } }
    ];

    const aggregated = aggregateHistoricalMetrics(mixedData);
    
    expect(aggregated.heartRate.min).toBe(60);
    expect(aggregated.heartRate.max).toBe(80);
    expect(aggregated.heartRate.average).toBe(70);
    
    expect(aggregated.spo2.min).toBe(94);
    expect(aggregated.spo2.max).toBe(98);
    expect(aggregated.spo2.average).toBe(96);
  });

  test('Health Score Aggregator: Evaluates and applies proper subsystem penalties on threshold failures', () => {
    const poorMetrics = {
      heartRate: { min: 55, max: 110, average: 105 }, // Tachycardia average criteria
      spo2: { min: 85, max: 92, average: 87 },       // Hypoxia criteria
      gas: { min: 100, max: 200, average: 150 }
    };

    const scores = calculateAggregatedHealthScores(poorMetrics, 90, 0, mockConfig);
    
    expect(scores.cardiovascularScore).toBe(60);
    expect(scores.respiratoryScore).toBe(50);
    expect(scores.environmentalSafetyScore).toBe(99); // Normal gas avg
    expect(scores.overallHealthScore).toBeLessThan(80);
  });

  test('Report Serializer: Validates lossless data roundtrips across JSON serialization formats', () => {
    const dummyReport: IPeriodicReport = {
      id: 'rpt_weekly_test_123',
      type: 'WEEKLY',
      startTimestamp: 1710000000000,
      endTimestamp: 1710518400000,
      generatedTimestamp: Date.now(),
      dataPointsEvaluated: 6,
      metrics: {
        heartRate: { min: 60, max: 90, average: 75 },
        spo2: { min: 95, max: 99, average: 97 },
        gas: { min: 50, max: 120, average: 85 }
      },
      healthScores: {
        cardiovascularScore: 95,
        respiratoryScore: 98,
        environmentalSafetyScore: 99,
        overallHealthScore: 96
      },
      criticalAlertCount: 0,
      primaryRiskDirectives: ['MAINTAIN_CURRENT_TRAINING_REGIMEN']
    };

    const wireFormat = serializeReport(dummyReport);
    const restoredReport = deserializeReport(wireFormat);

    expect(restoredReport.id).toBe(dummyReport.id);
    expect(restoredReport.healthScores.overallHealthScore).toBe(96);
    expect(restoredReport.primaryRiskDirectives[0]).toBe('MAINTAIN_CURRENT_TRAINING_REGIMEN');
  });

  test('Weekly Integration: Validates operational pipeline execution and standard output compliance', () => {
    const validData = generateMockDailySummaries(4); // Satisfies mock requirement of 3
    const report = reportEngine.generatePeriodicReport('WEEKLY', validData, 1710000000000, 1710345600000);

    expect(report.type).toBe('WEEKLY');
    expect(report.dataPointsEvaluated).toBe(4);
    expect(report.healthScores.overallHealthScore).toBe(93); // Blended baseline evaluation results
    expect(report.primaryRiskDirectives).toContain('MAINTAIN_CURRENT_TRAINING_REGIMEN');
  });
});