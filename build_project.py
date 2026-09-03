import os
import subprocess
import sys
import shutil

# =====================================================================
# EMBEDDED CODE MODULES: PR41.1 THROUGH PR42.8
# =====================================================================

# --- PR41.1: Robust Audit Logger Service ---
PR41_1_AUDIT_LOGGER = """export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'LOW' | 'MODERATE';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  severity: AuditSeverity;
  details: string;
  actor?: string;
  eventType?: string;
  nodeId?: string;
  simulated?: boolean;
}

class AuditLoggerService {
  private logs: AuditLogEntry[] = [];

  log(
    action: string,
    details: string,
    severity: AuditSeverity = 'INFO',
    actorOrNodeId: string = 'System Engine',
    simulated: boolean = false
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      action,
      severity,
      details,
      actor: actorOrNodeId,
      nodeId: actorOrNodeId,
      simulated,
    };
    this.logs.unshift(entry);
    return entry;
  }

  getLogs(): AuditLogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const auditLogger = new AuditLoggerService();
"""

# --- PR42.2: Contextual Analytics Dashboard Component ---
PR42_2_DASHBOARD = """import React from 'react';
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
"""

# --- PR42.3: System Integration & Anomaly Validation Suite ---
PR42_3_INTEGRATION_TEST = """import { describe, it, expect } from 'vitest';
import { AnalyticsDataAdapter } from '@/services/analyticsDataAdapter';

describe('PR42.3 Integration Engine', () => {
  it('correctly flags anomalous vitals against baseline thresholds', () => {
    const adapter = new AnalyticsDataAdapter();
    const result = adapter.processTelemetry({
      heartRate: 140,
      spo2: 88,
      gas: 500,
      timestamp: Date.now(),
    });

    expect(result.isHeartRateAnomalous).toBe(true);
    expect(result.isSpo2Anomalous).toBe(true);
    expect(result.isGasAnomalous).toBe(true);
  });
});
"""

# --- PR42.4: Contextual Baseline Engine ---
PR42_4_BASELINE_ENGINE = """export interface BaselineConfig {
  heartRateMin?: number;
  heartRateMax?: number;
  spo2Min?: number;
  gasThreshold?: number;
}

export interface BaselineBounds {
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  gasThreshold: number;
}

export class ContextualBaselineEngine {
  private config: BaselineBounds;

  constructor(config?: BaselineConfig) {
    this.config = {
      heartRateMin: config?.heartRateMin ?? 60,
      heartRateMax: config?.heartRateMax ?? 100,
      spo2Min: config?.spo2Min ?? 95,
      gasThreshold: config?.gasThreshold ?? 400,
    };
  }

  public calculateBaseline(_timestamp: number): BaselineBounds {
    return { ...this.config };
  }
}
"""

# --- PR42.5: Real-time Telemetry Data Streamer ---
PR42_5_TELEMETRY_STREAMER = """import { TelemetryMetrics } from '@/services/analyticsDataAdapter';

type TelemetryListener = (data: TelemetryMetrics) => void;

export class TelemetryStreamer {
  private listeners: TelemetryListener[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public startSimulation(intervalMs: number = 2000): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const packet: TelemetryMetrics = {
        heartRate: Math.floor(65 + Math.random() * 25),
        spo2: Math.floor(95 + Math.random() * 4),
        gas: Math.floor(100 + Math.random() * 50),
        timestamp: Date.now(),
      };
      this.listeners.forEach((listener) => listener(packet));
    }, intervalMs);
  }

  public stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const telemetryStreamer = new TelemetryStreamer();
"""

# --- PR42.6: Analytics Data Adapter & Telemetry Hook ---
PR42_6_DATA_ADAPTER = """import { ContextualBaselineEngine, BaselineConfig } from '@/types/analytics';

export interface TelemetryMetrics {
  heartRate: number;
  spo2: number;
  gas: number;
  timestamp: number;
}

export class AnalyticsDataAdapter {
  private baselineEngine: ContextualBaselineEngine;

  constructor(config?: BaselineConfig) {
    this.baselineEngine = new ContextualBaselineEngine(config);
  }

  public processTelemetry(packet: TelemetryMetrics) {
    const baseline = this.baselineEngine.calculateBaseline(packet.timestamp);
    
    return {
      timestamp: packet.timestamp,
      heartRate: packet.heartRate,
      spo2: packet.spo2,
      gas: packet.gas,
      isHeartRateAnomalous: packet.heartRate < baseline.heartRateMin || packet.heartRate > baseline.heartRateMax,
      isSpo2Anomalous: packet.spo2 < baseline.spo2Min,
      isGasAnomalous: packet.gas > baseline.gasThreshold,
    };
  }
}

export const analyticsAdapter = new AnalyticsDataAdapter();
"""

PR42_6_ANALYTICS_HOOK = """import { useState, useEffect } from 'react';
import { analyticsAdapter, TelemetryMetrics } from '@/services/analyticsDataAdapter';

export function useAnalyticsData(rawTelemetry: TelemetryMetrics | null) {
  const [processedData, setProcessedData] = useState<ReturnType<typeof analyticsAdapter.processTelemetry> | null>(null);

  useEffect(() => {
    if (rawTelemetry) {
      const metrics = analyticsAdapter.processTelemetry(rawTelemetry);
      setProcessedData(metrics);
    }
  }, [rawTelemetry]);

  return { processedData };
}
"""

# --- PR42.7: Anomaly Alert Rules Engine ---
PR42_7_ALERT_ENGINE = """import { auditLogger } from '@/services/auditLogger';

export interface AnomalyReport {
  isHeartRateAnomalous: boolean;
  isSpo2Anomalous: boolean;
  isGasAnomalous: boolean;
  heartRate: number;
  spo2: number;
  gas: number;
}

export class AlertEngine {
  public evaluateAlerts(report: AnomalyReport): void {
    if (report.isGasAnomalous) {
      auditLogger.log('GAS_EXCEEDED', `Hazardous gas level: ${report.gas} PPM`, 'CRITICAL');
    }
    if (report.isSpo2Anomalous) {
      auditLogger.log('SPO2_DROPPED', `Low oxygen saturation: ${report.spo2}%`, 'WARNING');
    }
    if (report.isHeartRateAnomalous) {
      auditLogger.log('HR_ANOMALY', `Abnormal heart rate: ${report.heartRate} bpm`, 'WARNING');
    }
  }
}

export const alertEngine = new AlertEngine();
"""

# --- PR42.8: Data Export Utility ---
PR42_8_EXPORT_SERVICE = """import { TelemetryMetrics } from '@/services/analyticsDataAdapter';

export class ExportService {
  public static exportToJSON(data: TelemetryMetrics[], filename: string = 'telemetry_export.json'): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
"""

# =====================================================================
# AUTOMATED BUILD ENGINE & RUNNER
# =====================================================================

def print_step(msg):
    print(f"\n[BUILD SCRIPT] ===> {msg}")

def write_file(filepath, content):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"   ✓ Synchronized: {filepath}")

def apply_pr_code_updates():
    print_step("1. Syncing PR41.1 through PR42.8 files...")
    write_file("src/services/auditLogger.ts", PR41_1_AUDIT_LOGGER)
    write_file("src/components/PR42AnalyticsDashboard.tsx", PR42_2_DASHBOARD)
    write_file("src/tests/pr42Integration.test.ts", PR42_3_INTEGRATION_TEST)
    write_file("src/types/analytics.ts", PR42_4_BASELINE_ENGINE)
    write_file("src/services/telemetryStreamer.ts", PR42_5_TELEMETRY_STREAMER)
    write_file("src/services/analyticsDataAdapter.ts", PR42_6_DATA_ADAPTER)
    write_file("src/hooks/useAnalyticsData.ts", PR42_6_ANALYTICS_HOOK)
    write_file("src/utils/alertEngine.ts", PR42_7_ALERT_ENGINE)
    write_file("src/services/exportService.ts", PR42_8_EXPORT_SERVICE)

def clean_artifacts():
    print_step("2. Cleaning build caches...")
    for folder in ["dist", ".vite", "node_modules/.cache"]:
        if os.path.exists(folder):
            try:
                shutil.rmtree(folder)
                print(f"   - Cleared {folder}")
            except Exception as e:
                print(f"   - Could not remove {folder}: {e}")

def run_command(command, allow_failure=False):
    try:
        result = subprocess.run(command, shell=True, check=not allow_failure, text=True, capture_output=True)
        if result.stdout:
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing: {command}")
        if e.stderr:
            print(e.stderr.strip())
        if not allow_failure:
            sys.exit(1)
        return False

def main():
    apply_pr_code_updates()
    clean_artifacts()

    print_step("3. Verifying npm dependencies...")
    run_command("npm install")

    print_step("4. Running TypeScript strict typecheck...")
    run_command("npx tsc --noEmit")

    print_step("5. Compiling Vite production bundle...")
    run_command("npm run build")

    print_step("🎉 ALL SET! PR42 IS OFFICIALLY COMPLETE (PR41.1 through PR42.8).")

if __name__ == "__main__":
    main()