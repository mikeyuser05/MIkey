import React from 'react';
import { useRealtimeChartController } from '../../hooks/useRealtimeChartController';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface RealtimeChartWrapperProps {
  nodeId: 'PR1' | 'PR2';
  metric: 'heartRate' | 'spo2' | 'temperature' | 'gas';
  strokeColor?: string;
  yAxisDomain?: [number, number] | string[];
}

export const RealtimeChartWrapper: React.FC<RealtimeChartWrapperProps> = ({
  nodeId,
  metric,
  strokeColor = '#3b82f6',
  yAxisDomain = ['auto', 'auto']
}) => {
  const { chartData } = useRealtimeChartController({
    nodeId,
    windowDurationMs: 300000, 
    maxPoints: 100
  });

  const metricLabels: Record<string, string> = {
    heartRate: 'Heart Rate (BPM)',
    spo2: 'SpO₂ (%)',
    temperature: 'Temperature (°C)',
    gas: 'Gas Level (PPM)'
  };

  return (
    <div className="w-full h-72 p-4 bg-gray-900 border border-gray-800 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          {nodeId} - {metricLabels[metric]}
        </h3>
        {chartData.length > 0 && (
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="timestamp" stroke="#6b7280" fontSize={11} tickLine={false} />
          <YAxis domain={yAxisDomain} stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: strokeColor }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};