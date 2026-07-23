/**
 * NOEXCUSE HPO V2 - Context Engine
 * Determines user state (RESTING, ACTIVE, SLEEPING) based on motion and timestamp data,
 * and adjusts physiological ranges dynamically.
 */

import { ActivityContext, ContextualMultiplier, ContextualizedRanges } from '../../types/contextualBaseline';
import { PersonalNormalRanges } from '../../types/normalRange';

export class ContextEngine {
  private static MULTIPLIERS: Record<ActivityContext, ContextualMultiplier> = {
    RESTING: { hrUpperMultiplier: 1.0, hrLowerMultiplier: 1.0, spo2LowerTolerance: 0 },
    ACTIVE: { hrUpperMultiplier: 1.65, hrLowerMultiplier: 1.15, spo2LowerTolerance: 2 },
    SLEEPING: { hrUpperMultiplier: 0.9, hrLowerMultiplier: 0.75, spo2LowerTolerance: 1 },
  };

  /**
   * Infers context using motion acceleration magnitude and current hour.
   */
  public inferContext(motionVal: number, timestampMs: number): ActivityContext {
    // Motion threshold for activity
    if (motionVal > 1.2) {
      return 'ACTIVE';
    }

    const hour = new Date(timestampMs).getHours();
    // Night window rule: 23:00 (11 PM) to 06:00 (6 AM) with minimal movement
    if ((hour >= 23 || hour < 6) && motionVal < 0.2) {
      return 'SLEEPING';
    }

    return 'RESTING';
  }

  /**
   * Adjusts normal ranges based on active context.
   */
  public adjustRangesForContext(
    ranges: PersonalNormalRanges,
    context: ActivityContext,
    timestampMs: number
  ): ContextualizedRanges {
    const mult = ContextEngine.MULTIPLIERS[context];
    const hr = ranges.heartRateRange;
    const spo2 = ranges.spo2Range;
    const gas = ranges.gasRange;

    const adjustedHrMin = Math.max(30, Math.round(hr.lowerBound * mult.hrLowerMultiplier));
    const adjustedHrMax = Math.min(220, Math.round(hr.upperBound * mult.hrUpperMultiplier));
    
    // SpO2 lower threshold slightly relaxes during high activity due to exertion
    const adjustedSpo2Min = Math.max(70, spo2.lowerBound - mult.spo2LowerTolerance);
    const adjustedSpo2Max = 100;

    return {
      context,
      timestamp: timestampMs,
      adjustedHrMin,
      adjustedHrMax,
      adjustedSpo2Min,
      adjustedSpo2Max,
      adjustedGasMax: gas.upperBound,
    };
  }
}

export const contextEngine = new ContextEngine();
