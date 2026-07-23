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
