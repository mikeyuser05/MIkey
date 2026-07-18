// src/telemetry/types/index.ts

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'OFFLINE' | 'ERROR';

export interface RawTelemetryPacket {
  ts: number;          // Hardware Epoch timestamp (ms)
  hr: number;          // Raw Heart Rate (bpm)
  spo2: number;        // Raw SpO2 percentage
  temp: number;        // Device Core Temperature (°C)
  ax: number;          // Accelerometer X axis
  ay: number;          // Accelerometer Y axis
  az: number;          // Accelerometer Z axis
  batt: number;        // Wearable Battery level percentage
  rssi: number;        // Network link Signal strength metric
}

export interface TelemetrySnapshot {
  deviceId: string;
  lastUpdated: number;
  metrics: RawTelemetryPacket;
}

export interface TelemetryState {
  devices: Record<string, TelemetrySnapshot>;
  connectionStatus: ConnectionState;
  error: string | null;
}
