/**
 * NOEXCUSE HPO V2 - Pipeline Types
 * Phase PR6.4: Predictive Health Intelligence Pipeline Integration
 */

import { ValidatedTelemetryPacket } from '../services/sqi/sqiFilter';
import { PersonalDeviationState } from './deviation';
import { HealthRiskScoreResult } from './riskScore';
import { ShortTermTrendResult } from './trend';
import { EarlyWarningResult } from './predictive';

export interface ComprehensiveHealthPacket {
  timestamp: number;
  userId: string;
  sqiPacket: ValidatedTelemetryPacket;
  deviationState: PersonalDeviationState;
  riskScore: HealthRiskScoreResult;
  trendResult: ShortTermTrendResult;
  earlyWarning: EarlyWarningResult;
}
