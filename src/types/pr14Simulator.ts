/**
 * NOEXCUSE HPO V2 - PR14 Hardware Simulator Types
 */

export type SensorFaultType = 
  | 'NONE'
  | 'MAX30100_DISCONNECT'
  | 'MQ9_HEATER_FAULT'
  | 'BMI270_ACCEL_FREEZE'
  | 'GPS_LOCK_LOST'
  | 'BATTERY_CRITICAL_DROP'
  | 'HIGH_PACKET_LOSS';

export interface VirtualSensorConfig {
  baseHeartRate: number;
  baseSpO2: number;
  baseGasPpm: number;
  motionIntensity: number; // 0 to 1
  noiseLevel: number; // 0 to 1
  activeFault: SensorFaultType;
  batteryPercent: number;
  transmissionRateHz: number;
}

export interface SyntheticWaveframe {
  timestamp: number;
  ppgValue: number;
  gasAnalogRaw: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  batteryPercent: number;
  faultActive: boolean;
}
