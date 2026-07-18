// src/telemetry/config/firebaseConfig.ts

export interface TelemetryModuleConfig {
  databaseURL: string;
  rootPath: string;
  connectionTimeoutMs: number;
  maxReconnectionAttempts: number;
}

// Immutable system constraints configuration
export const TELEMETRY_CONFIG: TelemetryModuleConfig = {
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "",
  rootPath: "telemetry/devices",
  connectionTimeoutMs: 10000,
  maxReconnectionAttempts: 5,
};
