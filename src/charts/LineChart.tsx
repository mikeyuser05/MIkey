import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ChartBaseProps } from '../types/chart.types';
import { CHART_METRIC_CONFIGS, GLOBAL_CHART_DEFAULTS } from '../config/chart.config';
import { getChartThemeColor } from '../utils/chartColors';
import { uniqueGlowFilterId } from '../utils/chartHelpers';
import { ChartContainer } from './ChartContainer';
import { ChartCard } from './ChartCard';
import { ChartLegend } from './ChartLegend';

export const LineChart: React.FC<ChartBaseProps> = ({ data, metricType, title, subtitle, unit, theme, isLoading = false, height = 240 }) => {
  const config = CHART_METRIC_CONFIGS[metricType];
  const activeTheme = theme || config.defaultTheme;
  const colors = getChartThemeColor(activeTheme);
  const glowId = uniqueGlowFilterId(metricType);

  return (
    <ChartCard title={title} subtitle={subtitle} unit={unit} isLoading={isLoading} isEmpty={!data || data.length === 0}>
      <ChartContainer height={height}>
        <RechartsLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
          </defs>
          <CartesianGrid strokeDasharray={GLOBAL_CHART_DEFAULTS.gridConfig.strokeDasharray} vertical={false} stroke={config.gridStroke} />
          <XAxis dataKey="formattedTime" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} dy={8} />
          <YAxis domain={config.yAxisDomain} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={GLOBAL_CHART_DEFAULTS.tooltipContentStyle} formatter={(value: number) => [`${value}${unit}`, config.name]} />
          <Line type="monotone" dataKey="value" stroke={colors.stroke} strokeWidth={2.5} dot={false} filter={`url(#${glowId})`} />
        </RechartsLineChart>
      </ChartContainer>
      <ChartLegend label={config.name} theme={activeTheme} />
    </ChartCard>
  );
};