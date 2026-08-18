#!/usr/bin/env python3
import os
import sys

# Deterministic File Map for PR30 - PR33 Roadmap Execution
files = {
    # --------------------------------------------------------------------------
    # PR30.0 / PR30.1: Telemetry Data Buffer & Types (Strict Non-Synthetic)
    # --------------------------------------------------------------------------
    "src/types/telemetry.ts": '''export interface TelemetryData {
  timestamp: number;
  heartRate: number;      // BPM
  spo2: number;           // %
  gasPpm: number;         // MQ-9 Gas PPM
  steps?: number;
  temperature?: number;   // Ambient / Skin
  rssi?: number;
  batteryVoltage?: number;
}

export interface TelemetryBufferPoint {
  timeLabel: string;
  timestamp: number;
  heartRate: number;
  spo2: number;
  gasPpm: number;
}

export interface AnomalyIndicator {
  id: string;
  metric: 'heartRate' | 'spo2' | 'gasPpm';
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  durationSeconds: number;
  timestamp: number;
}
''',

    "src/services/telemetryBuffer.ts": '''import { TelemetryData, TelemetryBufferPoint } from '../types/telemetry';

/**
 * 60-Second Rolling Window Telemetry Buffer
 * Manages live samples without memory leaks, synthetic data, or redundant state triggers.
 */
export class TelemetryBuffer {
  private buffer: TelemetryBufferPoint[] = [];
  private readonly maxWindowMs: number;

  constructor(windowSeconds: number = 60) {
    this.maxWindowMs = windowSeconds * 1000;
  }

  public push(sample: TelemetryData): TelemetryBufferPoint[] {
    if (!sample || typeof sample.timestamp !== 'number') {
      return this.buffer;
    }

    const now = sample.timestamp;
    const dateObj = new Date(now);
    const timeLabel = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const point: TelemetryBufferPoint = {
      timeLabel,
      timestamp: now,
      heartRate: Number.isFinite(sample.heartRate) ? sample.heartRate : 0,
      spo2: Number.isFinite(sample.spo2) ? sample.spo2 : 0,
      gasPpm: Number.isFinite(sample.gasPpm) ? sample.gasPpm : 0,
    };

    this.buffer.push(point);

    // Evict items older than rolling window cutoff
    const cutoff = now - this.maxWindowMs;
    while (this.buffer.length > 0 && this.buffer[0].timestamp < cutoff) {
      this.buffer.shift();
    }

    return [...this.buffer];
  }

  public getSnapshot(): TelemetryBufferPoint[] {
    return [...this.buffer];
  }

  public clear(): void {
    this.buffer = [];
  }
}
''',

    # --------------------------------------------------------------------------
    # PR30.2: Analytics Anomaly Engine (Independent from Emergency Gate)
    # --------------------------------------------------------------------------
    "src/services/analyticsEngine.ts": '''import { TelemetryBufferPoint, AnomalyIndicator } from '../types/telemetry';

export class AnalyticsEngine {
  private static HR_HIGH_THRESHOLD = 120; // BPM
  private static SPO2_LOW_THRESHOLD = 92;  // %
  private static GAS_HIGH_THRESHOLD = 300; // PPM

  private static hrHighStart: number | null = null;
  private static spo2LowStart: number | null = null;
  private static gasHighStart: number | null = null;

  /**
   * Evaluates persistent anomalies over time.
   * NOTE: Anomaly indicators are purely informative for visual analytics.
   * Emergency safety gating is strictly maintained separately by PR26 Emergency Service.
   */
  public static evaluateTrends(buffer: TelemetryBufferPoint[]): AnomalyIndicator[] {
    const anomalies: AnomalyIndicator[] = [];
    if (buffer.length === 0) return anomalies;

    const latest = buffer[buffer.length - 1];

    // 1. Persistent High Heart Rate Evaluation
    if (latest.heartRate > this.HR_HIGH_THRESHOLD) {
      if (!this.hrHighStart) this.hrHighStart = latest.timestamp;
      const durationSec = Math.floor((latest.timestamp - this.hrHighStart) / 1000);
      if (durationSec >= 10) {
        anomalies.push({
          id: 'hr-high-persistent',
          metric: 'heartRate',
          severity: latest.heartRate > 140 ? 'CRITICAL' : 'WARNING',
          message: `Persistent High HR (${latest.heartRate} BPM)`,
          durationSeconds: durationSec,
          timestamp: latest.timestamp,
        });
      }
    } else {
      this.hrHighStart = null;
    }

    // 2. Persistent Low SpO2 Evaluation
    if (latest.spo2 > 0 && latest.spo2 < this.SPO2_LOW_THRESHOLD) {
      if (!this.spo2LowStart) this.spo2LowStart = latest.timestamp;
      const durationSec = Math.floor((latest.timestamp - this.spo2LowStart) / 1000);
      if (durationSec >= 8) {
        anomalies.push({
          id: 'spo2-low-persistent',
          metric: 'spo2',
          severity: latest.spo2 < 88 ? 'CRITICAL' : 'WARNING',
          message: `Persistent Low Oxygen Saturation (${latest.spo2}%)`,
          durationSeconds: durationSec,
          timestamp: latest.timestamp,
        });
      }
    } else {
      this.spo2LowStart = null;
    }

    // 3. Persistent Environmental Gas Elevation
    if (latest.gasPpm > this.GAS_HIGH_THRESHOLD) {
      if (!this.gasHighStart) this.gasHighStart = latest.timestamp;
      const durationSec = Math.floor((latest.timestamp - this.gasHighStart) / 1000);
      if (durationSec >= 5) {
        anomalies.push({
          id: 'gas-high-persistent',
          metric: 'gasPpm',
          severity: latest.gasPpm > 600 ? 'CRITICAL' : 'WARNING',
          message: `Hazardous Gas Level Detected (${latest.gasPpm} PPM)`,
          durationSeconds: durationSec,
          timestamp: latest.timestamp,
        });
      }
    } else {
      this.gasHighStart = null;
    }

    return anomalies;
  }
}
''',

    # --------------------------------------------------------------------------
    # PR30.3: Telemetry Data Export Service (CSV / JSON)
    # --------------------------------------------------------------------------
    "src/services/telemetryExport.ts": '''import { TelemetryBufferPoint } from '../types/telemetry';

export class TelemetryExporter {
  public static exportToCSV(data: TelemetryBufferPoint[], filenamePrefix: string = 'hpo_telemetry'): void {
    if (!data || data.length === 0) {
      alert('No telemetry data available to export.');
      return;
    }

    const headers = ['Timestamp', 'ISO Time', 'Heart Rate (BPM)', 'SpO2 (%)', 'MQ-9 Gas (PPM)'];
    const rows = data.map(pt => [
      pt.timestamp,
      new Date(pt.timestamp).toISOString(),
      pt.heartRate,
      pt.spo2,
      pt.gasPpm
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${filenamePrefix}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  }

  public static exportToJSON(data: TelemetryBufferPoint[], filenamePrefix: string = 'hpo_telemetry'): void {
    if (!data || data.length === 0) {
      alert('No telemetry data available to export.');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filenamePrefix}_${Date.now()}.json`, 'application/json');
  }

  private static downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
''',

    # --------------------------------------------------------------------------
    # PR31.0: GPS / Location Types & Helper (Zero Fake Coordinates)
    # --------------------------------------------------------------------------
    "src/types/location.ts": '''export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null; // meters
  timestamp: number;
  source: 'gps' | 'network' | 'manual';
  valid: boolean;
}

export interface MapLinkOptions {
  latitude: number;
  longitude: number;
}

export class LocationValidator {
  public static isValidCoordinate(lat: number, lng: number): boolean {
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
    // Reject 0,0 default invalid fix
    if (lat === 0 && lng === 0) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  public static isStale(timestamp: number, maxAgeMs: number = 120000): boolean {
    if (!timestamp) return true;
    return (Date.now() - timestamp) > maxAgeMs;
  }

  public static generateGoogleMapsUrl(lat: number, lng: number): string | null {
    if (!this.isValidCoordinate(lat, lng)) return null;
    return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  }
}
''',

    # --------------------------------------------------------------------------
    # PR32: System Observability & Health Service
    # --------------------------------------------------------------------------
    "src/services/systemHealthService.ts": '''export interface SystemHealthStatus {
  telemetryStream: 'LIVE' | 'STALE' | 'OFFLINE';
  firebaseConnection: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  alertEngineStatus: 'ACTIVE' | 'STANDBY';
  backendApiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  twilioCallingReady: boolean;
  lastTelemetryTimestamp: number | null;
}

export class SystemHealthService {
  public static evaluateHealth(
    lastTelemetryTs: number | null,
    isFirebaseConnected: boolean,
    isBackendAlive: boolean
  ): SystemHealthStatus {
    const now = Date.now();
    let telemetryStreamStatus: 'LIVE' | 'STALE' | 'OFFLINE' = 'OFFLINE';

    if (lastTelemetryTs) {
      const ageSec = (now - lastTelemetryTs) / 1000;
      if (ageSec <= 15) telemetryStreamStatus = 'LIVE';
      else if (ageSec <= 60) telemetryStreamStatus = 'STALE';
      else telemetryStreamStatus = 'OFFLINE';
    }

    return {
      telemetryStream: telemetryStreamStatus,
      firebaseConnection: isFirebaseConnected ? 'CONNECTED' : 'DISCONNECTED',
      alertEngineStatus: 'ACTIVE',
      backendApiStatus: isBackendAlive ? 'ONLINE' : 'OFFLINE',
      twilioCallingReady: isBackendAlive,
      lastTelemetryTimestamp: lastTelemetryTs,
    };
  }
}
'''
}

def main():
    print("==========================================================")
    print(" NOEXCUSE HPO V2 — PR30-PR33 Deterministic File Generator ")
    print("==========================================================")

    created_count = 0
    updated_count = 0
    skipped_count = 0

    for path, content in files.items():
        dir_name = os.path.dirname(path)
        if dir_name and not os.path.exists(dir_name):
            os.makedirs(dir_name, exist_ok=True)

        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                existing_content = f.read()
            if existing_content == content.strip():
                print(f"SKIPPED (Unchanged): {path}")
                skipped_count += 1
                continue
            else:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content.strip() + "\n")
                print(f"UPDATED: {path}")
                updated_count += 1
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content.strip() + "\n")
            print(f"CREATED: {path}")
            created_count += 1

    print("----------------------------------------------------------")
    print(f"Summary: Created {created_count}, Updated {updated_count}, Skipped {skipped_count}")
    print("System architecture preserved successfully.")
    print("==========================================================")

if __name__ == "__main__":
    main()