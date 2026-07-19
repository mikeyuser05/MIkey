import { UserActivity } from '../../activity/types/activity';
import { IRollingMetrics, IActivityAccumulation } from '../types/trends';

export interface IDailyMetricsSummary {
  dateKey: string;
  maxHeartRate: number;
  minHeartRate: number;
  averageSpO2: number;
  highestGasReading: number;
  dominantActivity: UserActivity;
  totalActiveTimeMs: number;
}

/**
 * Pure deterministic calculation node to derive aggregate daily metrics
 * without any recommendation, alert, or natural language injection logic.
 */
export const compileDailyMetrics = (
  dateKey: string,
  rollingMetrics: IRollingMetrics,
  activityMetrics: IActivityAccumulation
): IDailyMetricsSummary => {
  
  // Identify dominant activity based on absolute accumulated duration thresholds
  let dominantActivity: UserActivity = 'UNKNOWN';
  let maxDuration = -1;

  const activities = Object.keys(activityMetrics.activityDurationsMs) as UserActivity[];
  for (let i = 0; i < activities.length; i++) {
    const act = activities[i];
    const duration = activityMetrics.activityDurationsMs[act];
    if (duration > maxDuration) {
      maxDuration = duration;
      dominantActivity = act;
    }
  }

  // Calculate active moving time intervals (Summation of WALKING and RUNNING duration vectors)
  const walkingTime = activityMetrics.activityDurationsMs['WALKING'] || 0;
  const runningTime = activityMetrics.activityDurationsMs['RUNNING'] || 0;
  const totalActiveTimeMs = walkingTime + runningTime;

  return {
    dateKey,
    maxHeartRate: rollingMetrics.heartRate.max,
    minHeartRate: rollingMetrics.heartRate.min,
    averageSpO2: rollingMetrics.spo2.avg,
    highestGasReading: rollingMetrics.gas.max,
    dominantActivity,
    totalActiveTimeMs
  };
};\n