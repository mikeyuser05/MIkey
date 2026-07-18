import { ChartMetricType, ChartColorTheme } from '../types/chart.types';

export interface MetricConfig {
  name: string;
  unit: string;
  defaultTheme: ChartColorTheme;
  yAxisDomain: [number, number] | 'auto';
  gridStroke: string;
}

export const CHART_METRIC_CONFIGS: Record<ChartMetricType, MetricConfig> = {
  HeartRate: {
    name: 'Heart Rate',
    unit: 'BPM',
    defaultTheme: 'rose',
    yAxisDomain: [40, 200],
    gridStroke: 'rgba(244, 63, 94, 0.05)',
  },
  SpO2: {
    name: 'Oxygen Saturation',
    unit: '%',
    defaultTheme: 'cyan',
    yAxisDomain: [80, 100],
    gridStroke: 'rgba(6, 182, 212, 0.05)',
  },
  Gas: {
    name: 'Atmospheric Gas',
    unit: 'PPM',
    defaultTheme: 'orange',
    yAxisDomain: [0, 1000],
    gridStroke: 'rgba(249, 115, 22, 0.05)',
  },
  Steps: {
    name: 'Pedometer Count',
    unit: 'steps',
    defaultTheme: 'amber',
    yAxisDomain: 'auto',
    gridStroke: 'rgba(245, 158, 11, 0.05)',
  },
  Battery: {
    name: 'Battery Level',
    unit: '%',
    defaultTheme: 'emerald',
    yAxisDomain: [0, 100],
    gridStroke: 'rgba(16, 185, 129, 0.05)',
  },
  Temperature: {
    name: 'Core Temperature',
    unit: '°C',
    defaultTheme: 'violet',
    yAxisDomain: [30, 45],
    gridStroke: 'rgba(139, 92, 246, 0.05)',
  },
  Stress: {
    name: 'Biometric Stress index',
    unit: 'score',
    defaultTheme: 'indigo',
    yAxisDomain: [0, 100],
    gridStroke: 'rgba(99, 102, 241, 0.05)',
  },
};

export const GLOBAL_CHART_DEFAULTS = {
  animationDuration: 300,
  tooltipContentStyle: {
    backgroundColor: '#0f172a',
    borderRadius: '0.75rem',
    border: '1px solid #1e293b',
    padding: '0.75rem 1rem',
  },
  gridConfig: {
    strokeDasharray: '3 3',
    vertical: false,
  },
};