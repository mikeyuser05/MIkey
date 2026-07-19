/**
 * NOEXCUSE HPO V2: PR4.1 Telemetry Intelligence Domain Types
 * Core model definitions for single-wearable stream classification.
 */

export interface IRawTelemetry {
  timestamp: number;    // Epoch millisecond timestamp of the raw packet
  heartRate: number;    // Raw heart rate value from biometrics sensor
  spo2: number;         // Raw oxygen saturation percentage
  gas: number;          // Raw unified gas density from MQ sensor
  steps: number;        // Step counter cumulative index
  alarm: boolean;       // Physical emergency panic button state
  link: number;         // Link quality signal index
  lastPacket: number;   // Epoch millisecond index of the last physical packet
}

export type HeartState = 'LOW' | 'NORMAL' | 'ELEVATED' | 'CRITICAL_HIGH';
export type SpO2State  = 'NORMAL' | 'LOW' | 'CRITICAL_LOW';
export type GasState   = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface IClassifiedHealthStates {
  timestamp: number;    // Snapshot time corresponding to the latest raw frame evaluated
  heartState: HeartState;
  spo2State: SpO2State;
  gasState: GasState;
}