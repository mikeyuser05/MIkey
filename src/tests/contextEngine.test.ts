/**
 * NOEXCUSE HPO V2 - Context Engine Unit Tests
 */

import { ContextEngine } from '../services/context/contextEngine';
import { PersonalNormalRanges } from '../types/normalRange';

describe('ContextEngine', () => {
  let engine: ContextEngine;

  beforeEach(() => {
    engine = new ContextEngine();
  });

  const mockRanges: PersonalNormalRanges = {
    userId: 'user_1',
    calculatedAt: Date.now(),
    confidence: 'HIGH',
    heartRateRange: { lowerBound: 60, upperBound: 80, targetMean: 70, toleranceMargin: 10, isStatedProfileFallback: false },
    spo2Range: { lowerBound: 95, upperBound: 100, targetMean: 98, toleranceMargin: 5, isStatedProfileFallback: false },
    gasRange: { lowerBound: 0, upperBound: 300, targetMean: 100, toleranceMargin: 200, isStatedProfileFallback: false },
  };

  it('infers ACTIVE state when motion exceeds threshold', () => {
    const context = engine.inferContext(1.8, Date.now());
    expect(context).toBe('ACTIVE');
  });

  it('infers SLEEPING state during night hours with low motion', () => {
    // Set time to 2:00 AM
    const nightTime = new Date(2026, 6, 23, 2, 0, 0).getTime();
    const context = engine.inferContext(0.05, nightTime);
    expect(context).toBe('SLEEPING');
  });

  it('expands heart rate upper boundary during ACTIVE state', () => {
    const adjusted = engine.adjustRangesForContext(mockRanges, 'ACTIVE', Date.now());
    expect(adjusted.adjustedHrMax).toBeGreaterThan(mockRanges.heartRateRange.upperBound);
    expect(adjusted.adjustedHrMax).toBe(Math.round(80 * 1.65)); // 132 bpm
  });

  it('lowers heart rate lower boundary during SLEEPING state', () => {
    const adjusted = engine.adjustRangesForContext(mockRanges, 'SLEEPING', Date.now());
    expect(adjusted.adjustedHrMin).toBeLessThan(mockRanges.heartRateRange.lowerBound);
    expect(adjusted.adjustedHrMin).toBe(Math.round(60 * 0.75)); // 45 bpm
  });
});
