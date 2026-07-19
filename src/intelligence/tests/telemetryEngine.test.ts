import { TelemetryIntelligenceEngine } from '../engine/telemetryEngine';
import { IEngineConfig } from '../config/engineConfig';
import { IRawTelemetry } from '../types/health';
import { describe, beforeEach, test, expect } from 'vitest';
describe('PR4.1 Telemetry Intelligence Engine - Automated Test Suite', () => {
  let engine: TelemetryIntelligenceEngine;
  
  // Strict test configuration profile
  const mockConfig: IEngineConfig = {
    windows: {
      heartWindowMs: 10000, // 10s window for rapid tests
      spo2WindowMs: 10000,
      gasWindowMs: 10000,
    },
    thresholds: {
      heart: { low: 50, high: 120, criticalHigh: 160 },
      spo2: { low: 94, critical: 90 },
      gas: { warning: 400, critical: 800 },
    },
  };

  const createBasePacket = (timestamp: number): IRawTelemetry => ({
    timestamp,
    heartRate: 75,
    spo2: 98,
    gas: 150,
    steps: 1000,
    alarm: false,
    link: 3,
    lastPacket: timestamp,
  });

  beforeEach(() => {
    engine = new TelemetryIntelligenceEngine(mockConfig);
  });

  test('Deterministic States: Normal range telemetry outputs NORMAL states', () => {
    const packet = createBasePacket(Date.now());
    const outcome = engine.processIncomingTelemetry(packet);

    expect(outcome.heartState).toBe('NORMAL');
    expect(outcome.spo2State).toBe('NORMAL');
    expect(outcome.gasState).toBe('NORMAL');
  });

  test('Heart Rate Thresholds: Correctly classifies elevated and critical states', () => {
    const baseTime = Date.now();
    
    const elevatedPacket = { ...createBasePacket(baseTime), heartRate: 130 };
    let outcome = engine.processIncomingTelemetry(elevatedPacket);
    expect(outcome.heartState).toBe('ELEVATED');

    const criticalPacket = { ...createBasePacket(baseTime + 1000), heartRate: 170 };
    outcome = engine.processIncomingTelemetry(criticalPacket);
    expect(outcome.heartState).toBe('CRITICAL_HIGH');
  });

  test('SpO2 Fault Isolation: Safeguards against zeroed disconnected sensor states', () => {
    const packet = { ...createBasePacket(Date.now()), spo2: 0 };
    const outcome = engine.processIncomingTelemetry(packet);
    
    // Should pass through smoothly as NORMAL instead of crashing out or alerting Hypoxia
    expect(outcome.spo2State).toBe('NORMAL');
  });

  test('Gas Metrics: Detects and steps up warning levels correctly', () => {
    const baseTime = Date.now();
    
    const warningPacket = { ...createBasePacket(baseTime), gas: 500 };
    let outcome = engine.processIncomingTelemetry(warningPacket);
    expect(outcome.gasState).toBe('WARNING');

    const criticalPacket = { ...createBasePacket(baseTime + 1000), gas: 900 };
    outcome = engine.processIncomingTelemetry(criticalPacket);
    expect(outcome.gasState).toBe('CRITICAL');
  });

  test('Sliding Window Buffering: Correctly evacuates stale historical packets', () => {
    const startTime = 1000000; // Epoch fixture tracking baseline
    
    // Inject extreme threat value inside historical boundary
    const earlyThreatPacket = { ...createBasePacket(startTime), gas: 950 };
    let outcome = engine.processIncomingTelemetry(earlyThreatPacket);
    expect(outcome.gasState).toBe('CRITICAL');

    // Process normal packet right at the exact window limit boundary (10 seconds later)
    const edgePacket = { ...createBasePacket(startTime + 10000), gas: 120 };
    outcome = engine.processIncomingTelemetry(edgePacket);
    expect(outcome.gasState).toBe('NORMAL'); // Historical threat dropped cleanly from cache
  });
});