import React from 'react';
import { ChartColorTheme } from '../types/chart.types';
import { CHART_THEME_COLORS } from '../utils/chartColors';

export const ChartLegend: React.FC<{ label: string; theme: ChartColorTheme }> = ({ label, theme }) => {
  const colors = CHART_THEME_COLORS[theme] || CHART_THEME_COLORS.rose;
  return (
    <div className="flex items-center gap-2 select-none mt-2 justify-end">
      <span className="w-3 h-1.5 rounded-sm shadow-sm" style={{ backgroundColor: colors.stroke }} />
      <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{label}</span>
    </div>
  );
};