import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartBaseProps } from '../types/chart.types';
import { CHART_METRIC_CONFIGS, GLOBAL_CHART_DEFAULTS } from '../config/chart.config';
import { getChartThemeColor } from '../utils/chartColors';
import { uniqueGradientId } from '../utils/chartHelpers';
import { ChartContainer } from './ChartContainer';
import { ChartCard } from './ChartCard';
import { ChartLegend } from './ChartLegend';

export const AreaChart: React.FC<ChartBaseProps> = ({ data, metricType, title, subtitle, unit, theme, isLoading = false, height = 240 }) => {
  const config = CHART_METRIC_CONFIGS[metricType];
  const activeTheme = theme || config.defaultTheme;
  const colors = getChartThemeColor(activeTheme);
  const gradientId = uniqueGradientId(metricType);

  return (
    <ChartCard title={title} subtitle={subtitle} unit={unit} isLoading={isLoading} isEmpty={!data || data.length === 0}>
      <ChartContainer height={height}>
        <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={colors.stroke} stopOpacity={0.24} /><stop offset="100%" stopColor={colors.stroke} stopOpacity={0.0} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray={GLOBAL_CHART_DEFAULTS.gridConfig.strokeDasharray} vertical={false} stroke={config.gridStroke} />
          <XAxis dataKey="formattedTime" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis domain={config.yAxisDomain} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={GLOBAL_CHART_DEFAULTS.tooltipContentStyle} formatter={(value: number) => [`${value}${unit}`, config.name]} />
          <Area type="monotone" dataKey="value" stroke={colors.stroke} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} />
        </RechartsAreaChart>
      </ChartContainer>
      <ChartLegend label={config.name} theme={activeTheme} />
    </ChartCard>
  );
};