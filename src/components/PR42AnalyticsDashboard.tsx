import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { TelemetryMetrics } from '@/services/analyticsDataAdapter';

interface DashboardProps {
  telemetry: TelemetryMetrics | null;
  history: TelemetryMetrics[];
}

export const PR42AnalyticsDashboard: React.FC<DashboardProps> = ({ telemetry, history }) => {
  const { processedData } = useAnalyticsData(telemetry);

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">PR42 Baseline Telemetry Analytics</h2>
          <p className="text-xs text-slate-400">Contextual bounds monitoring engine</p>
        </div>
        {processedData && (
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded text-xs font-semibold ${processedData.isHeartRateAnomalous ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              HR: {processedData.heartRate} bpm
            </span>
            <span className={`px-3 py-1 rounded text-xs font-semibold ${processedData.isSpo2Anomalous ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              SpO₂: {processedData.spo2}%
            </span>
            <span className={`px-3 py-1 rounded text-xs font-semibold ${processedData.isGasAnomalous ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              Gas: {processedData.gas} PPM
            </span>
          </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleTimeString()} stroke="#64748b" fontSize={12} />
            <YAxis domain={['auto', 'auto'] as any} stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
            <Area type="monotone" dataKey="heartRate" stroke="#3b82f6" fillOpacity={0.2} fill="#3b82f6" name="Heart Rate" />
            <Area type="monotone" dataKey="spo2" stroke="#10b981" fillOpacity={0.1} fill="#10b981" name="SpO₂" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
