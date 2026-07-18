import React, { useMemo } from 'react';
import { useOptimizedChartStream } from '../../hooks/useOptimizedChartStream';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PolishedChartProps {
  nodeId: 'PR1' | 'PR2';
  metric: 'heartRate' | 'spo2' | 'temperature' | 'gas';
  strokeColor: string;
  fillColor: string;
  yAxisDomain: [number, number];
  accessibleLabel: string;
}

export const OptimizedTelemetryChart: React.FC<PolishedChartProps> = React.memo(({
  nodeId,
  metric,
  strokeColor,
  fillColor,
  yAxisDomain,
  accessibleLabel
}) => {
  const chartData = useOptimizedChartStream(nodeId, metric, 60000);

  const meta = useMemo(() => {
    const registry: Record<string, { title: string; unit: string }> = {
      heartRate: { title: 'Heart Rate', unit: 'BPM' },
      spo2: { title: 'Blood Oxygen', unit: '%' },
      temperature: { title: 'Core Temp', unit: '°C' },
      gas: { title: 'Propane/Gas', unit: 'PPM' }
    };
    return registry[metric] || { title: metric, unit: '' };
  }, [metric]);

  const latestValue = useMemo(() => {
    if (chartData.length === 0) return '--';
    return `${chartData[chartData.length - 1][metric]}`;
  }, [chartData, metric]);

  return (
    <div className="bg-neutral-900/30 backdrop-blur-md p-5 rounded-2xl border border-neutral-800/80 hover:border-neutral-700/60 transition-all duration-300 shadow-xl group" role="region" aria-label={accessibleLabel}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-neutral-700/40 font-mono tracking-wider">{nodeId}</span>
          <h4 className="text-sm font-medium text-neutral-200 font-mono">{meta.title}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-950/60 px-2 py-0.5 rounded-md border border-neutral-900">
            {latestValue} {meta.unit}
          </span>
          {chartData.length > 0 && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </div>
      </div>

      <div className="h-56 w-full">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center border border-dashed border-neutral-800/60 rounded-xl text-xs text-neutral-500 font-mono bg-neutral-950/20">
            Awaiting clean telemetry execution pipeline...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id={`prod_grad_${nodeId}_${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={fillColor} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={fillColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#525252" fontSize={10} tickLine={false} dy={8} />
              <YAxis domain={yAxisDomain} stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px' }}
                itemStyle={{ color: strokeColor, fontSize: '11px', fontFamily: 'monospace' }}
                labelStyle={{ color: '#737373', fontSize: '10px', fontFamily: 'monospace' }}
              />
              <Area type="monotone" dataKey={metric} stroke={strokeColor} strokeWidth={2} fillOpacity={1} fill={`url(#prod_grad_${nodeId}_${metric})`} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
});

OptimizedTelemetryChart.displayName = 'OptimizedTelemetryChart';