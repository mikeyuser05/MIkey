import { ChartDataPoint } from '../types/chart.types';
import { ChartStats, TrendDirection } from '../types/chartEngine.types';

export class LiveChartEngine {
  public static calculateStats(points: ChartDataPoint[]): ChartStats {
    const sampleCount = points.length;
    if (sampleCount === 0) {
      return { currentValue: 0, minimum: 0, maximum: 0, average: 0, trend: 'Stable', sampleCount: 0, latestTimestamp: null };
    }
    const values = points.map(p => p.value);
    const currentValue = values[values.length - 1];
    return {
      currentValue,
      minimum: Math.min(...values),
      maximum: Math.max(...values),
      average: Math.round((values.reduce((s, v) => s + v, 0) / sampleCount) * 10) / 10,
      trend: this.detectTrend(values),
      sampleCount,
      latestTimestamp: points[points.length - 1].timestamp,
    };
  }
  private static detectTrend(values: number[]): TrendDirection {
    if (values.length < 3) return 'Stable';
    const subset = values.slice(-5);
    let totalDiff = 0;
    for (let i = 1; i < subset.length; i++) totalDiff += subset[i] - subset[i - 1];
    if (totalDiff > 0.5) return 'Rising';
    if (totalDiff < -0.5) return 'Falling';
    return 'Stable';
  }
}