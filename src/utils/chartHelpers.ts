import { ChartDataPoint } from '../types/chart.types';

export const isChartDataEmpty = (data?: ChartDataPoint[]): boolean => !data || data.length === 0;
export const uniqueGradientId = (metricType: string): string => `chart-gradient-${metricType.toLowerCase()}`;
export const uniqueGlowFilterId = (metricType: string): string => `chart-glow-${metricType.toLowerCase()}`;