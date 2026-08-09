import { TelemetryReadingInput } from '../../types/sqi';
import { PersonalHealthProfile } from '../../types/profile';
import { PersonalNormalRanges } from '../../types/normalRange';
import { SQIEngine } from '../sqi/sqiEngine';
import { SQIFilter } from '../sqi/sqiFilter';
import { BaselineEngine } from '../baseline/baselineEngine';
import { baselineRepository } from '../baseline/baselineRepository';
import { normalRangeEngine } from '../range/normalRangeEngine';
import { contextEngine } from '../context/contextEngine';
import { deviationEngine } from '../deviation/deviationEngine';

export class HealthIntelligencePipeline {
  /**
   * Processes a single raw telemetry packet through the entire PR5 architecture.
   */
  public processPacket(
    raw: TelemetryReadingInput,
    profile: PersonalHealthProfile
  ): any {
    const startTime = performance.now();
    const userId = profile.id;

    const sqiFilter = new SQIFilter();
    const baselineEngine = new BaselineEngine();

    // Safe timestamp allocation
    const packetTimestamp = raw.timestampMs ?? (raw as any).timestamp ?? Date.now();

    // 1. SQI Validation
    const sqiResult = SQIEngine.evaluate(raw);
    const validatedPacket = sqiFilter.process(raw as any);

    // 2. Fetch and Update Statistical Baseline
    let currentBaseline = baselineRepository.getByUserId(userId);
    if (sqiResult.isValidForBaseline) {
      currentBaseline = baselineEngine.accumulateBatch(currentBaseline, [validatedPacket]);
      baselineRepository.save(currentBaseline);
    }

    // 3. Normal Range Check safely retrieved
    const normalRanges: PersonalNormalRanges = (normalRangeEngine as any).calculateRanges 
      ? (normalRangeEngine as any).calculateRanges(profile, currentBaseline)
      : (normalRangeEngine as any).evaluateRanges(profile, currentBaseline);

    const hrRange = normalRanges.heartRateResting || normalRanges.heartRateRange;
    const spO2Range = normalRanges.spO2Resting || normalRanges.spo2Range;

    // 4. Activity & Time-of-Day Context Inference (PR5.6)
    const motionVal = raw.accelMagnitude ?? 0;
    const activeContext = contextEngine.inferContext(motionVal, packetTimestamp);
    const contextualRanges = contextEngine.adjustRangesForContext(
      normalRanges,
      activeContext,
      packetTimestamp
    );

    // 5. Contextual Normal Range Overrides for Deviation Engine
    const dynamicRanges: PersonalNormalRanges = {
      ...normalRanges,
      heartRateRange: {
        ...hrRange,
        lowerBound: contextualRanges.adjustedHrMin,
        upperBound: contextualRanges.adjustedHrMax,
      },
      spo2Range: {
        ...spO2Range,
        lowerBound: contextualRanges.adjustedSpo2Min,
        upperBound: contextualRanges.adjustedSpo2Max,
      },
    };

    // 6. Evaluate Deviation (PR5.5)
    const deviationState = deviationEngine.evaluateDeviation(validatedPacket, dynamicRanges);

    const endTime = performance.now();

    return {
      timestamp: packetTimestamp,
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
