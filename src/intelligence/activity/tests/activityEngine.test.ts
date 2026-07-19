import { ActivityRecognitionEngine } from '../engine/activityEngine';
import { IActivityConfig } from '../config/activityConfig';
import { IRawTelemetry } from '../../types/health';

describe('PR4.2 Activity Recognition Engine - Automated Test Suite', () => {
  let engine: ActivityRecognitionEngine;

  // Dedicated test configuration profile with tightly bound durations for rapid testing
  const mockConfig: IActivityConfig = {
    windowSizeMs: 5000,
    stabilization: {
      debounceDelayMs: 1000,
      minHoldDurationMs: {
        UNKNOWN: 0,
        STANDING: 1000,
        SITTING: 1000,
        LYING: 1000,
        WALKING: 1000,
        RUNNING: 1000,
        FALL: 0,
        NO_MOVEMENT: 1000,
      },
    },
    thresholds: {
      walkingVelocityMin: 0.5,
      runningVelocityMin: 2.2,
      noMovementHeartRateMax: 60,
      runningHeartRateMin: 100,
    },
  };

  const createWindowFixture = (
    baseTime: number,
    frameCount: number,
    stepStart: number,
    stepIncrement: number,
    heartRate: number
  ): IRawTelemetry[] => {
    const window: IRawTelemetry[] = [];
    for (let i = 0; i < frameCount; i++) {
      window.push({
        timestamp: baseTime + i * 1000,
        heartRate,
        spo2: 98,
        gas: 200,
        steps: stepStart + i * stepIncrement,
        alarm: false,
        link: 3,
        lastPacket: baseTime + i * 1000,
      });
    }
    return window;
  };

  beforeEach(() => {
    engine = new ActivityRecognitionEngine(mockConfig);
  });

  test('Deterministic States: Processes resting metabolic profile as NO_MOVEMENT', () => {
    const startTime = Date.now();
    // 0 step increment, low heart rate (<= 60)
    const window = createWindowFixture(startTime, 3, 1000, 0, 55);
    const result = engine.processActivityWindow(window);

    expect(result.currentActivity).toBe('NO_MOVEMENT');
  });

  test('Deterministic States: Processes higher metabolic profiles without steps as SITTING', () => {
    const startTime = Date.now();
    // 0 step increment, moderate heart rate (> 60)
    const window = createWindowFixture(startTime, 3, 1000, 0, 75);
    const result = engine.processActivityWindow(window);

    expect(result.currentActivity).toBe('SITTING');
  });

  test('Motion Feature Evaluation: Correctly classifies standard walking loops', () => {
    const startTime = Date.now();
    // 1 step per second delta satisfies walking threshold (> 0.5 steps/sec)
    const window = createWindowFixture(startTime, 4, 1000, 1, 80);
    const result = engine.processActivityWindow(window);

    expect(result.currentActivity).toBe('WALKING');
  });

  test('Motion Feature Evaluation: Correctly classifies running velocity thresholds', () => {
    const startTime = Date.now();
    // 3 steps per second delta satisfies running threshold (> 2.2 steps/sec)
    const window = createWindowFixture(startTime, 4, 1000, 3, 110);
    const result = engine.processActivityWindow(window);

    expect(result.currentActivity).toBe('RUNNING');
  });

  test('State Stabilization: Debounces rapid classifications until timing constraint is satisfied', () => {
    const startTime = Date.now();

    // Establish baseline state (SITTING)
    const window1 = createWindowFixture(startTime, 2, 1000, 0, 75);
    let result = engine.processActivityWindow(window1);
    expect(result.currentActivity).toBe('SITTING');

    // Introduce immediate burst of walking telemetry at next step boundary (within debounce limit)
    const window2 = createWindowFixture(startTime + 1500, 2, 1000, 1, 80);
    result = engine.processActivityWindow(window2);
    
    // Should remain locked as SITTING because debounce delay requirement (1000ms) hasn't passed inside window differential
    expect(result.currentActivity).toBe('SITTING');

    // Provide sustained walking window to break past the debounce boundary constraint
    const window3 = createWindowFixture(startTime + 3000, 4, 1000, 1, 85);
    result = engine.processActivityWindow(window3);
    expect(result.currentActivity).toBe('WALKING');
  });
});\n