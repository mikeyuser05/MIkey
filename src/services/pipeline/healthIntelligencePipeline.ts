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
