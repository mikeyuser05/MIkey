import os
from pathlib import Path

PHASE_NAME = "PR5.7 — Personal Health Intelligence Pipeline Integration"

FILES = {
    "src/types/pipeline.ts": '''
/**
 * NOEXCUSE HPO V2 - Pipeline Integration Types
 * Phase PR5.7: Personal Health Intelligence Pipeline
 */

import { RawTelemetry } from './sqi';
import { ValidatedTelemetryPacket } from '../services/sqi/sqiFilter';
import { PersonalBaselineState } from './baseline';
import { PersonalNormalRanges } from './normalRange';
import { ContextualizedRanges } from './contextualBaseline';
import { PersonalDeviationState } from './deviation';

export interface HealthIntelligencePipelineOutput {
  timestamp: number;
  userId: string;
  validatedPacket: ValidatedTelemetryPacket;
  baselineState: PersonalBaselineState;
  normalRanges: PersonalNormalRanges;
  contextualRanges: ContextualizedRanges;
  deviationState: PersonalDeviationState;
  processingTimeMs: number;
}
''',

    "src/services/pipeline/healthIntelligencePipeline.ts": '''
/**
 * NOEXCUSE HPO V2 - Health Intelligence Pipeline Orchestrator
 * Integrates PR5.1 through PR5.6 into a high-performance stream processor.
 */

import { RawTelemetry } from '../../types/sqi';
import { PersonalHealthProfile } from '../../types/profile';
import { sqiEngine } from '../sqi/sqiEngine';
import { sqiFilter } from '../sqi/sqiFilter';
import { baselineEngine } from '../baseline/baselineEngine';
import { baselineRepository } from '../baseline/baselineRepository';
import { normalRangeEngine } from '../range/normalRangeEngine';
import { contextEngine } from '../context/contextEngine';
import { deviationEngine } from '../deviation/deviationEngine';
import { HealthIntelligencePipelineOutput } from '../../types/pipeline';

export class HealthIntelligencePipeline {
  /**
   * Processes a single raw telemetry packet through the entire PR5 architecture.
   */
  public processPacket(
    raw: RawTelemetry,
    profile: PersonalHealthProfile
  ): HealthIntelligencePipelineOutput {
    const startTime = performance.now();
    const userId = profile.id;

    // 1. SQI Validation
    const sqiResult = sqiEngine.evaluate(raw);
    const validatedPacket = sqiFilter.filterPacket(raw, sqiResult);

    // 2. Fetch and Update Statistical Baseline
    let currentBaseline = baselineRepository.getByUserId(userId);
    if (validatedPacket.sqi.isUsableForBaselines) {
      currentBaseline = baselineEngine.updateBaseline(currentBaseline, validatedPacket);
      baselineRepository.save(currentBaseline);
    }

    // 3. Compute Personal Normal Ranges (PR5.4)
    const normalRanges = normalRangeEngine.computeRanges(profile, currentBaseline);

    // 4. Activity & Time-of-Day Context Inference (PR5.6)
    const motionVal = raw.accelMagnitude ?? 0;
    const activeContext = contextEngine.inferContext(motionVal, raw.timestamp);
    const contextualRanges = contextEngine.adjustRangesForContext(
      normalRanges,
      activeContext,
      raw.timestamp
    );

    // 5. Contextual Normal Range Overrides for Deviation Engine
    const dynamicRanges: PersonalNormalRanges = {
      ...normalRanges,
      heartRateRange: {
        ...normalRanges.heartRateRange,
        lowerBound: contextualRanges.adjustedHrMin,
        upperBound: contextualRanges.adjustedHrMax,
      },
      spo2Range: {
        ...normalRanges.spo2Range,
        lowerBound: contextualRanges.adjustedSpo2Min,
        upperBound: contextualRanges.adjustedSpo2Max,
      },
    };

    // 6. Evaluate Deviation (PR5.5)
    const deviationState = deviationEngine.evaluateDeviation(validatedPacket, dynamicRanges);

    const endTime = performance.now();

    return {
      timestamp: raw.timestamp,
      userId,
      validatedPacket,
      baselineState: currentBaseline,
      normalRanges,
      contextualRanges,
      deviationState,
      processingTimeMs: Number((endTime - startTime).toFixed(2)),
    };
  }
}

export const healthIntelligencePipeline = new HealthIntelligencePipeline();
''',

    "src/tests/healthIntelligencePipeline.test.ts": '''
/**
 * NOEXCUSE HPO V2 - Pipeline End-to-End Integration Tests
 */

import { HealthIntelligencePipeline } from '../services/pipeline/healthIntelligencePipeline';
import { DEFAULT_HEALTH_PROFILE } from '../services/profile/profileValidator';
import { RawTelemetry } from '../types/sqi';
import { baselineRepository } from '../services/baseline/baselineRepository';

describe('HealthIntelligencePipeline Integration', () => {
  let pipeline: HealthIntelligencePipeline;

  beforeEach(() => {
    pipeline = new HealthIntelligencePipeline();
    baselineRepository.reset();
  });

  it('successfully processes a valid resting telemetry frame', () => {
    const rawPacket: RawTelemetry = {
      timestamp: Date.now(),
      heartRate: 72,
      spo2: 98,
      gasLevel: 110,
      accelMagnitude: 0.05,
    };

    const output = pipeline.processPacket(rawPacket, DEFAULT_HEALTH_PROFILE);

    expect(output.userId).toBe(DEFAULT_HEALTH_PROFILE.id);
    expect(output.validatedPacket.sqi.isUsableForBaselines).toBe(true);
    expect(output.contextualRanges.context).toBe('RESTING');
    expect(output.deviationState.hasAnyDeviation).toBe(false);
    expect(output.processingTimeMs).toBeLessThan(50); // High-performance guarantee
  });

  it('correctly suppresses baseline update on corrupted SQI packet while still calculating deviation', () => {
    const corruptedPacket: RawTelemetry = {
      timestamp: Date.now(),
      heartRate: 240, // Unrealistic spike
      spo2: 98,
      gasLevel: 100,
      accelMagnitude: 0.1,
    };

    const output = pipeline.processPacket(corruptedPacket, DEFAULT_HEALTH_PROFILE);

    expect(output.validatedPacket.sqi.heartRateQuality.isValid).toBe(false);
    expect(output.deviationState.heartRateDeviation.currentValue).toBeNull();
  });

  it('adapts context to ACTIVE and adjusts bounds under heavy movement', () => {
    const activePacket: RawTelemetry = {
      timestamp: Date.now(),
      heartRate: 115,
      spo2: 97,
      gasLevel: 100,
      accelMagnitude: 2.1, // High motion
    };

    const output = pipeline.processPacket(activePacket, DEFAULT_HEALTH_PROFILE);

    expect(output.contextualRanges.context).toBe('ACTIVE');
    // 115 bpm should not trigger critical deviation when ACTIVE context expands limits
    expect(output.deviationState.heartRateDeviation.severity).toBe('NORMAL');
  });
});
'''
}

def build():
    print("==================================================")
    print(f"Executing: {PHASE_NAME}")
    print("==================================================")
    for file_path, content in FILES.items():
        path = Path(file_path)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        print(f"Created/Updated: {file_path}")
    print(f"\n{PHASE_NAME} build completed successfully.\n")

if __name__ == "__main__":
    build()