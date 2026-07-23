/**
 * NOEXCUSE HPO V2 - Unified Predictive Health Pipeline
 * Connects SQI -> Personal Deviation -> Risk Engine -> Trend Engine -> Predictive Early Warning
 */

import { TelemetryPacket } from '../../types/telemetry';
import { UserPersonalBaseline } from '../../types/baseline';
import { ContextualFactors } from '../../types/contextualBaseline';
import { ComprehensiveHealthPacket } from '../../types/pipeline';

import { sqiFilter } from '../sqi/sqiFilter';
import { contextualBaselineEngine } from '../context/contextualBaselineEngine';
import { deviationEngine } from '../deviation/deviationEngine';
import { healthRiskEngine } from '../risk/riskEngine';
import { trendEngine } from '../trend/trendEngine';
import { predictiveEngine } from '../predictive/predictiveEngine';

export class PredictivePipeline {
  /**
   * Processes a raw telemetry frame through the entire intelligence pipeline.
   */
  public processTelemetry(
    userId: string,
    rawTelemetry: TelemetryPacket,
    baseline: UserPersonalBaseline,
    contextFactors: ContextualFactors
  ): ComprehensiveHealthPacket {
    // 1. SQI Validation
    const sqiPacket = sqiFilter.processPacket(rawTelemetry);

    // 2. Contextual Range Adjustment
    const contextualRanges = contextualBaselineEngine.getAdjustedRanges(baseline, contextFactors);

    // 3. Individual Deviation Detection
    const deviationState = deviationEngine.evaluateDeviations(sqiPacket, contextualRanges, userId);

    // 4. Health Risk Scoring (PR6.1)
    const riskScore = healthRiskEngine.calculateRiskScore(deviationState);

    // 5. Short-Term Kinematic Trend Analysis (PR6.2)
    const trendResult = trendEngine.analyzeTrend(userId, sqiPacket);

    // 6. Early-Warning Predictive Anomaly Generation (PR6.3)
    const earlyWarning = predictiveEngine.generateEarlyWarning(riskScore, trendResult, contextualRanges);

    return {
      timestamp: rawTelemetry.timestamp,
      userId,
      sqiPacket,
      deviationState,
      riskScore,
      trendResult,
      earlyWarning,
    };
  }
}

export const predictivePipeline = new PredictivePipeline();
