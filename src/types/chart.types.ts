export type ChartMetricType = 'HeartRate' | 'SpO2' | 'Gas' | 'Steps' | 'Battery' | 'Temperature' | 'Stress';

export interface ChartDataPoint {
  timestamp: number;
  formattedTime: string;
  value: number;
}

export type ChartColorTheme = 'rose' | 'cyan' | 'orange' | 'amber' | 'emerald' | 'violet' | 'indigo';

export interface ChartBaseProps {
  data: ChartDataPoint[];
  metricType: ChartMetricType;
  title: string;
  subtitle?: string;
  unit: string;
  theme?: ChartColorTheme;
  isLoading?: boolean;
  height?: number | string;
}