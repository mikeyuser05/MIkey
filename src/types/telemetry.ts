export interface TelemetryData {
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
