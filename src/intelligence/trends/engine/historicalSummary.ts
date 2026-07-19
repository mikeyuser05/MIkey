import { UserActivity } from '../../activity/types/activity';
import { ITrendAnalysisSummary, IRollingMetrics, IActivityAccumulation } from '../types/trends';
import { ITrendConfig } from '../config/trendConfig';
import { calculateRollingStats } from './rollingStats';
import { calculateActivityDurations } from './activityDuration';
import { detectTrends } from './trendDetection';

/**
 * Pure deterministic coordination node that orchestrates downstream calculation blocks 
 * into a single structured historical summary context profile.
 */
export const generateHistoricalSummary = (
  telemetryHistory: { timestamp: number; heartRate: number; spo2: number; gas: number }[],
  activityHistory: { timestamp: number; currentActivity: UserActivity }[],
  config: ITrendConfig
): ITrendAnalysisSummary => {
  const latestTimestamp = telemetryHistory.length > 0 
    ? telemetryHistory[telemetryHistory.length - 1].timestamp 
    : Date.now();

  // 1. Calculate isolated statistical profiles
  const rollingMetrics: IRollingMetrics = calculateRollingStats(telemetryHistory);
  
  // 2. Aggregate active chronological activity partitions
  const activityMetrics: IActivityAccumulation = calculateActivityDurations(activityHistory);
  
  // 3. Compute structural trend vector differentials
  const trends = detectTrends(telemetryHistory, config);

  return {
    timestamp: latestTimestamp,
    rollingMetrics,
    activityMetrics,
    trends
  };
};