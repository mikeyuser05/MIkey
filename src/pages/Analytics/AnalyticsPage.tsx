import { useEffect, useState, useRef, ReactElement } from 'react';
import { LineChart as LineChartIcon, Heart, Wind, Activity, Zap, Download } from 'lucide-react';
import { useGlobalContext } from '@hooks/useGlobalContext';
import { TelemetryBuffer } from '../../services/telemetryBuffer';
import { TelemetryBufferPoint } from '../../types/telemetry';
import { AnalyticsEngine } from '../../services/analyticsEngine';
import { TelemetryExporter } from '../../services/telemetryExport';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export function AnalyticsPage(): ReactElement {
  const globalContext = useGlobalContext() as any;
  const telemetry = globalContext?.telemetry || { heartRate: 0, spO2: 0, gas: 0, steps: 0 };

  const bufferRef = useRef<TelemetryBuffer>(new TelemetryBuffer(60));
  const [chartData, setChartData] = useState<TelemetryBufferPoint[]>([]);

  // Push incoming telemetry into rolling 60-second window buffer
  useEffect(() => {
    if (telemetry) {
      const updated = bufferRef.current.push({
        timestamp: Date.now(),
        heartRate: Number(telemetry.heartRate) || 0,
        spo2: Number(telemetry.spO2 || telemetry.spo2) || 0,
        gasPpm: Number(telemetry.gas || telemetry.gasPpm) || 0,
      });
      setChartData([...updated]);
    }
  }, [telemetry]);

  const currentHr = telemetry.heartRate ? Math.round(Number(telemetry.heartRate)) : '--';
  const currentSpo2 = (telemetry.spO2 || telemetry.spo2) ? Math.round(Number(telemetry.spO2 || telemetry.spo2)) : '--';
  const currentGas = (telemetry.gas ?? telemetry.gasPpm) ?? '--';

  const anomalies = AnalyticsEngine.evaluateTrends(chartData);

  return (
    <div className="p-6 space-y-6">
      {/* Header & Export Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Biometric Stream Analytics</h1>
          <p className="text-sm text-slate-500">LGN.7 PR4 Intelligence Pipeline • Live Telemetry Processing</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-semibold border border-emerald-500/20">
            <Zap className="h-4 w-4 animate-pulse" />
            Engine Active
          </div>
          <button
            onClick={() => TelemetryExporter.exportToCSV(chartData)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
          <button
            onClick={() => TelemetryExporter.exportToJSON(chartData)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition"
          >
            <Download className="h-3.5 w-3.5" /> Export JSON
          </button>
        </div>
      </div>

      {/* KPI Stream Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Heart Rate Stream</span>
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentHr} <span className="text-sm font-normal text-slate-500">bpm</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">SpO2 Oxygen Saturation</span>
            <Activity className="h-4 w-4 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentSpo2} <span className="text-sm font-normal text-slate-500">%</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">MQ-9 Air Quality</span>
            <Wind className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentGas} <span className="text-sm font-normal text-slate-500">PPM</span>
          </p>
        </div>
      </div>

      {/* PR30.2 Trend Anomaly Indicators */}
      {anomalies.length > 0 && (
        <div className="space-y-2">
          {anomalies.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-xl text-xs flex justify-between items-center ${
                a.severity === 'CRITICAL'
                  ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              }`}
            >
              <div className="flex items-center gap-2 font-medium">
                <span>⚠️</span>
                <span>{a.message}</span>
              </div>
              <span className="font-mono">Duration: {a.durationSeconds}s</span>
            </div>
          ))}
        </div>
      )}

      {/* Realtime Rolling 60s Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vitals Intelligence Stream */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary-500" />
            Vitals Intelligence Stream (60s Window)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2 (%)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Hazard Stream */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Wind className="h-5 w-5 text-amber-500" />
            Environmental Hazard Stream (MQ-9 Gas)
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="timeLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="gasPpm"
                  name="MQ-9 Gas (PPM)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;