import os
import subprocess
import sys
import shutil

# =====================================================================
# EMBEDDED CODE MODULES: PR41.1 THROUGH PR43.4
# =====================================================================

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

PR43_1_TYPES = """export type LocationSource = 'gps' | 'ysh' | 'none';
export type RuntimeMode = 'live' | 'test';

export interface YSHConfig {
  enabled: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  satellites?: number;
  label: string;
  updatedAt: number;
  source: 'ysh';
}

export interface RawGPSTelemetry {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  satellites: number;
  isFixValid: boolean;
  timestamp?: number;
}

export interface ResolvedLocation {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  satellites: number;
  source: LocationSource;
  label?: string;
  isFixValid: boolean;
}
"""

PR43_1_YSH_SERVICE = """import { ref, onValue, set } from 'firebase/database';
import { db } from '@/config/firebase';
import { YSHConfig } from '@/types/location';

const YSH_LOCATION_PATH = 'system/ysh/location';

export const validateCoordinates = (lat: number, lng: number, alt: number): boolean => {
  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof alt !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(alt)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
};

export const subscribeYSHConfig = (callback: (config: YSHConfig | null) => void) => {
  const yshRef = ref(db, YSH_LOCATION_PATH);
  return onValue(yshRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as YSHConfig);
    } else {
      callback(null);
    }
  });
};

export const updateYSHConfig = async (config: Omit<YSHConfig, 'updatedAt' | 'source'>) => {
  if (!validateCoordinates(config.latitude, config.longitude, config.altitude)) {
    throw new Error('Invalid coordinates or altitude value provided for YSH.');
  }

  const payload: YSHConfig = {
    ...config,
    source: 'ysh',
    updatedAt: Date.now(),
  };

  const yshRef = ref(db, YSH_LOCATION_PATH);
  await set(yshRef, payload);
};
"""

PR43_1_LOCATION_RESOLVER = """import { RawGPSTelemetry, YSHConfig, ResolvedLocation, RuntimeMode } from '@/types/location';
import { validateCoordinates } from '@/services/yshService';

interface ResolveLocationParams {
  runtimeMode: RuntimeMode;
  isDeviceOnline: boolean;
  gpsTelemetry: RawGPSTelemetry | null;
  yshConfig: YSHConfig | null;
  isTestScenarioActive?: boolean;
}

export const resolveLocation = ({
  runtimeMode,
  isDeviceOnline,
  gpsTelemetry,
  yshConfig,
  isTestScenarioActive = false,
}: ResolveLocationParams): ResolvedLocation => {
  const realSatellites = gpsTelemetry?.satellites ?? 0;

  const hasValidGPS =
    gpsTelemetry !== null &&
    gpsTelemetry.isFixValid &&
    gpsTelemetry.latitude !== null &&
    gpsTelemetry.longitude !== null &&
    validateCoordinates(
      gpsTelemetry.latitude,
      gpsTelemetry.longitude,
      gpsTelemetry.altitude ?? 0
    );

  const hasValidYSH =
    yshConfig !== null &&
    yshConfig.enabled &&
    validateCoordinates(yshConfig.latitude, yshConfig.longitude, yshConfig.altitude);

  if (runtimeMode === 'live') {
    if (!isDeviceOnline) {
      return {
        latitude: null,
        longitude: null,
        altitude: null,
        satellites: 0,
        source: 'none',
        isFixValid: false,
      };
    }

    if (hasValidGPS) {
      return {
        latitude: gpsTelemetry!.latitude,
        longitude: gpsTelemetry!.longitude,
        altitude: gpsTelemetry!.altitude ?? 0,
        satellites: realSatellites,
        source: 'gps',
        isFixValid: true,
      };
    }

    if (hasValidYSH) {
      return {
        latitude: yshConfig!.latitude,
        longitude: yshConfig!.longitude,
        altitude: yshConfig!.altitude,
        satellites: yshConfig!.satellites ?? realSatellites,
        source: 'ysh',
        label: yshConfig!.label,
        isFixValid: true,
      };
    }

    return {
      latitude: null,
      longitude: null,
      altitude: null,
      satellites: realSatellites,
      source: 'none',
      isFixValid: false,
    };
  }

  if (runtimeMode === 'test') {
    if (hasValidGPS && isDeviceOnline) {
      return {
        latitude: gpsTelemetry!.latitude,
        longitude: gpsTelemetry!.longitude,
        altitude: gpsTelemetry!.altitude ?? 0,
        satellites: realSatellites,
        source: 'gps',
        isFixValid: true,
      };
    }

    if (hasValidYSH) {
      return {
        latitude: yshConfig!.latitude,
        longitude: yshConfig!.longitude,
        altitude: yshConfig!.altitude,
        satellites: yshConfig!.satellites ?? realSatellites,
        source: 'ysh',
        label: yshConfig!.label,
        isFixValid: true,
      };
    }
  }

  return {
    latitude: null,
    longitude: null,
    altitude: null,
    satellites: 0,
    source: 'none',
    isFixValid: false,
  };
};
"""

PR43_2_YSH_CONTROL_PANEL = """import React, { useState, useEffect } from 'react';
import { YSHConfig } from '@/types/location';
import { updateYSHConfig, subscribeYSHConfig } from '@/services/yshService';

export const YSHControlPanel: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<string>('26.912400');
  const [longitude, setLongitude] = useState<string>('75.787300');
  const [altitude, setAltitude] = useState<string>('431');
  const [satellites, setSatellites] = useState<string>('0');
  const [label, setLabel] = useState<string>('YSH Fallback Location');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeYSHConfig((config) => {
      if (config) {
        setEnabled(config.enabled);
        setLatitude(config.latitude.toString());
        setLongitude(config.longitude.toString());
        setAltitude(config.altitude.toString());
        if (config.satellites !== undefined) {
          setSatellites(config.satellites.toString());
        }
        setLabel(config.label || 'YSH Fallback Location');
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const latNum = parseFloat(latitude);
      const lngNum = parseFloat(longitude);
      const altNum = parseFloat(altitude);
      const satNum = parseInt(satellites, 10);

      if (isNaN(latNum) || isNaN(lngNum) || isNaN(altNum)) {
        throw new Error('Coordinates and altitude must be valid numbers.');
      }

      await updateYSHConfig({
        enabled,
        latitude: latNum,
        longitude: lngNum,
        altitude: altNum,
        satellites: isNaN(satNum) ? 0 : satNum,
        label,
      });

      setStatusMessage('YSH Location updated successfully!');
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 shadow-md max-w-md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <h3 className="font-semibold text-base text-slate-200">LOCATION SOURCE</h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
          CUSTOM LOCATION
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Enable YSH Fallback</label>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Altitude (m)</label>
              <input
                type="number"
                step="any"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Satellites</label>
              <input
                type="number"
                value={satellites}
                onChange={(e) => setSatellites(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded transition-colors"
        >
          {isSaving ? 'Updating Firebase...' : 'Update Custom Location'}
        </button>

        {statusMessage && (
          <p className={`text-xs mt-2 ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
"""

PR43_3_LOCATION_HOOK = """import { useState, useEffect } from 'react';
import { RawGPSTelemetry, YSHConfig, ResolvedLocation, RuntimeMode } from '@/types/location';
import { subscribeYSHConfig } from '@/services/yshService';
import { resolveLocation } from '@/utils/locationResolver';

interface UseLocationTelemetryProps {
  runtimeMode: RuntimeMode;
  isDeviceOnline: boolean;
  gpsTelemetry: RawGPSTelemetry | null;
  isTestScenarioActive?: boolean;
}

export function useLocationTelemetry({
  runtimeMode,
  isDeviceOnline,
  gpsTelemetry,
  isTestScenarioActive = false,
}: UseLocationTelemetryProps) {
  const [yshConfig, setYshConfig] = useState<YSHConfig | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation>(() =>
    resolveLocation({ runtimeMode, isDeviceOnline, gpsTelemetry, yshConfig: null, isTestScenarioActive })
  );

  useEffect(() => {
    const unsubscribe = subscribeYSHConfig((config) => {
      setYshConfig(config);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const resolved = resolveLocation({
      runtimeMode,
      isDeviceOnline,
      gpsTelemetry,
      yshConfig,
      isTestScenarioActive,
    });
    setResolvedLocation(resolved);
  }, [runtimeMode, isDeviceOnline, gpsTelemetry, yshConfig, isTestScenarioActive]);

  return { resolvedLocation, yshConfig };
}
"""

# --- PR43.4: Location Resolver Unit & Fallback Integration Tests ---
PR43_4_LOCATION_TEST = """import { describe, it, expect } from 'vitest';
import { resolveLocation } from '@/utils/locationResolver';
import { YSHConfig, RawGPSTelemetry } from '@/types/location';

describe('PR43.4 Location Resolver & Fallback Suite', () => {
  const validGPS: RawGPSTelemetry = {
    latitude: 28.6139,
    longitude: 77.209,
    altitude: 216,
    satellites: 8,
    isFixValid: true,
  };

  const validYSH: YSHConfig = {
    enabled: true,
    latitude: 26.9124,
    longitude: 75.7873,
    altitude: 431,
    satellites: 0,
    label: 'YSH Base',
    updatedAt: Date.now(),
    source: 'ysh',
  };

  it('prioritizes GPS when GPS fix is valid and device is online in live mode', () => {
    const result = resolveLocation({
      runtimeMode: 'live',
      isDeviceOnline: true,
      gpsTelemetry: validGPS,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('gps');
    expect(result.latitude).toBe(28.6139);
    expect(result.isFixValid).toBe(true);
  });

  it('falls back to YSH when GPS fix is invalid in live mode', () => {
    const invalidGPS = { ...validGPS, isFixValid: false };
    const result = resolveLocation({
      runtimeMode: 'live',
      isDeviceOnline: true,
      gpsTelemetry: invalidGPS,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('ysh');
    expect(result.latitude).toBe(26.9124);
    expect(result.label).toBe('YSH Base');
    expect(result.isFixValid).toBe(true);
  });

  it('returns source none when device is offline in live mode', () => {
    const result = resolveLocation({
      runtimeMode: 'live',
      isDeviceOnline: false,
      gpsTelemetry: validGPS,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('none');
    expect(result.latitude).toBeNull();
    expect(result.isFixValid).toBe(false);
  });

  it('allows YSH fallback in test mode even if device is offline', () => {
    const result = resolveLocation({
      runtimeMode: 'test',
      isDeviceOnline: false,
      gpsTelemetry: null,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('ysh');
    expect(result.latitude).toBe(26.9124);
    expect(result.isFixValid).toBe(true);
  });
});
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
    print_step("1. Syncing PR41.1 through PR43.4 files...")
    write_file("src/services/auditLogger.ts", PR41_1_AUDIT_LOGGER)
    write_file("src/components/PR42AnalyticsDashboard.tsx", PR42_2_DASHBOARD)
    write_file("src/tests/pr42Integration.test.ts", PR42_3_INTEGRATION_TEST)
    write_file("src/types/analytics.ts", PR42_4_BASELINE_ENGINE)
    write_file("src/services/telemetryStreamer.ts", PR42_5_TELEMETRY_STREAMER)
    write_file("src/services/analyticsDataAdapter.ts", PR42_6_DATA_ADAPTER)
    write_file("src/hooks/useAnalyticsData.ts", PR42_6_ANALYTICS_HOOK)
    write_file("src/utils/alertEngine.ts", PR42_7_ALERT_ENGINE)
    write_file("src/services/exportService.ts", PR42_8_EXPORT_SERVICE)
    
    # PR43.1 Files
    write_file("src/types/location.ts", PR43_1_TYPES)
    write_file("src/services/yshService.ts", PR43_1_YSH_SERVICE)
    write_file("src/utils/locationResolver.ts", PR43_1_LOCATION_RESOLVER)

    # PR43.2 File
    write_file("src/components/YSHControlPanel.tsx", PR43_2_YSH_CONTROL_PANEL)

    # PR43.3 File
    write_file("src/hooks/useLocationTelemetry.ts", PR43_3_LOCATION_HOOK)

    # PR43.4 File
    write_file("src/tests/pr43LocationResolver.test.ts", PR43_4_LOCATION_TEST)

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

    print_step("4. Compiling Vite production bundle...")
    run_command("npm run build")

    print_step("🎉 PR43.4 Integration Test suite successfully created!")

if __name__ == "__main__":
    main()