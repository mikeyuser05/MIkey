/**
 * NOEXCUSE HPO V2: PR4.11.8 End-to-End Analytics Pipeline Integration Test Suite
 * Validates data integrity preservation across sequential engine blocks.
 */
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { PipelineOrchestrator } from '../pipelineOrchestrator';
import { IRawTelemetryFrame } from '../pipelineTypes';

describe('PR4.11.8 Analytics Pipeline End-to-End Integration Tests', () => {
  let orchestrator: PipelineOrchestrator;

  beforeEach(() => {
    orchestrator = PipelineOrchestrator.getInstance();
  });

  afterEach(() => {
    orchestrator.tearDownOrchestrator();
  });

  it('Should process...', () => {
    const normalFrame: IRawTelemetryFrame = {
      deviceId: 'TEST_DEVICE_INTEGRATION',
      timestamp: Date.now(),
      heartRate: 75,
      spo2: 98,
      gasConcentration: 150,
      rawAcceleration: { x: 0.1, y: 0.2, z: 0.9 }
    };

    const unsubscribe = orchestrator.subscribe((state) => {
      // Basic telemetry mapping assertions
      expect(state.healthState.isSafe).toBe(true);
      expect(state.healthState.heartRateStatus).toBe('NORMAL');
      expect(state.activityState.currentActivity).toBe('RESTING');
      expect(state.alertState.isTriggered).toBe(false);
      
      // AI prompt aggregation assertions
      expect(state.aiPrompt.compiledPayload).toContain('ACTIVITY: RESTING');
      expect(state.aiPrompt.compiledPayload).toContain('PRIMARY ACTION: REC_NOMINAL');
      expect(state.reportMetadata.pipelineExecutionTimeMs).toBeLessThan(50); // High-performance check
      
      unsubscribe();
    });

    orchestrator.processIncomingFrame(normalFrame);
  });

  it('Should catch malformed payloads and gracefully invoke emergency fallback structures', () => {
    const brokenFrame = null as unknown as IRawTelemetryFrame;

    const unsubscribe = orchestrator.subscribe((state) => {
      // Error boundary fallbacks assertions
      expect(state.healthState.heartRateStatus).toBe('UNKNOWN');
      expect(state.alertState.isTriggered).toBe(true);
      expect(state.alertState.message).toContain('Pipeline degradation');
      expect(state.recommendations.primaryActionCode).toBe('REC_FALLBACK');
      expect(state.aiPrompt.compiledPayload).toBe('FALLBACK MATRIX INJECTED: WAITING FOR RECOVERY');
      
      unsubscribe();
    });

    orchestrator.processIncomingFrame(brokenFrame);
  });
});