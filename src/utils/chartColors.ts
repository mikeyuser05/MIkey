import { ChartColorTheme } from '../types/chart.types';

export interface ColorDefinition {
  stroke: string;
  fill: string;
  gradientStart: string;
  gradientEnd: string;
  glow: string;
}

export const CHART_THEME_COLORS: Record<ChartColorTheme, ColorDefinition> = {
  rose: { stroke: '#f43f5e', fill: 'rgba(244, 63, 94, 0.1)', gradientStart: 'rgba(244, 63, 94, 0.25)', gradientEnd: 'rgba(244, 63, 94, 0.0)', glow: 'rgba(244, 63, 94, 0.4)' },
  cyan: { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.1)', gradientStart: 'rgba(6, 182, 212, 0.25)', gradientEnd: 'rgba(6, 182, 212, 0.0)', glow: 'rgba(6, 182, 212, 0.4)' },
  orange: { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.1)', gradientStart: 'rgba(249, 115, 22, 0.25)', gradientEnd: 'rgba(249, 115, 22, 0.0)', glow: 'rgba(249, 115, 22, 0.4)' },
  amber: { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)', gradientStart: 'rgba(245, 158, 11, 0.25)', gradientEnd: 'rgba(245, 158, 11, 0.0)', glow: 'rgba(245, 158, 11, 0.4)' },
  emerald: { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)', gradientStart: 'rgba(16, 185, 129, 0.25)', gradientEnd: 'rgba(16, 185, 129, 0.0)', glow: 'rgba(16, 185, 129, 0.4)' },
  violet: { stroke: '#8b5cf6', fill: 'rgba(139, 92, 246, 0.1)', gradientStart: 'rgba(139, 92, 246, 0.25)', gradientEnd: 'rgba(139, 92, 246, 0.0)', glow: 'rgba(139, 92, 246, 0.4)' },
  indigo: { stroke: '#6366f1', fill: 'rgba(99, 102, 241, 0.1)', gradientStart: 'rgba(99, 102, 241, 0.25)', gradientEnd: 'rgba(99, 102, 241, 0.0)', glow: 'rgba(99, 102, 241, 0.4)' },
};

export const getChartThemeColor = (theme?: ChartColorTheme): ColorDefinition => CHART_THEME_COLORS[theme || 'rose'];