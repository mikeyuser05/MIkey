import { ChartDataPoint } from './chart.types';

export type TimeWindowSize = '30s' | '1m' | '5m';

export type TrendDirection = 'Rising' | 'Falling' | 'Stable';

export interface ChartStats {
  currentValue: number;
  minimum: number;
  maximum: number;
  average: number;
  trend: TrendDirection;
  sampleCount: number;
  latestTimestamp: number | null;
}

export interface UseLiveChartResult {
  data: ChartDataPoint[];
  stats: ChartStats;
  isLoading: boolean;
}