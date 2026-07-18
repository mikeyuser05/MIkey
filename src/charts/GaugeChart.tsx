import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartMetricType, ChartColorTheme } from '../types/chart.types';
import { CHART_METRIC_CONFIGS } from '../config/chart.config';
import { getChartThemeColor } from '../utils/chartColors';
import { ChartCard } from './ChartCard';

export const GaugeChart: React.FC<{ value: number; metricType: ChartMetricType; title: string; subtitle?: string; unit: string; min?: number; max?: number; theme?: ChartColorTheme; isLoading?: boolean }> = ({
  value, metricType, title, subtitle, unit, min = 0, max = 100, theme, isLoading = false
}) => {
  const config = CHART_METRIC_CONFIGS[metricType];
  const colors = getChartThemeColor(theme || config.defaultTheme);
  const percent = (Math.max(min, Math.min(max, value)) - min) / (max - min);

  return (
    <ChartCard title={title} subtitle={subtitle} unit={unit} isLoading={isLoading} isEmpty={value === undefined || value === null}>
      <div className="flex flex-col items-center justify-center relative min-h-[160px] pt-4">
        <PieChart width={200} height={110}>
          <Pie data={[{ value: percent * 180 }, { value: 180 - (percent * 180) }]} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={65} outerRadius={80} dataKey="value" stroke="none">
            <Cell fill={colors.stroke} /><Cell fill="#1e293b" />
          </Pie>
        </PieChart>
        <div className="absolute bottom-2 text-center select-none">
          <span className="text-2xl font-extrabold text-white block">{value}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">{unit}</span>
        </div>
      </div>
    </ChartCard>
  );
};