import { HeartState, SpO2State, GasState } from '../types/health';

export interface ThresholdRange {
  low: number;
  high: number;
  criticalHigh?: number;
}

export interface IEngineConfig {
  // Configurable sliding window periods in milliseconds
  windows: {
    heartWindowMs: number;
    spo2WindowMs: number;
    gasWindowMs: number;
  };
  // Hard thresholds for isolated physical ruleset evaluation
  thresholds: {
    heart: {
      low: number;          // Below this is LOW
      high: number;         // Above this is ELEVATED
      criticalHigh: number; // Above this is CRITICAL_HIGH
    };
    spo2: {
      low: number;          // Below this is LOW
      critical: number;     // Below this is CRITICAL_LOW
    };
    gas: {
      warning: number;      // Above this is WARNING
      critical: number;     // Above this is CRITICAL
    };
  };
}

/**
 * Default production config values for NOEXCUSE HPO V2
 */
export const DEFAULT_ENGINE_CONFIG: IEngineConfig = {
  windows: {
    heartWindowMs: 30000,   // 30 Seconds sliding window
    spo2WindowMs: 45000,    // 45 Seconds sliding window for slow oxygen trends
    gasWindowMs: 15000,     // 15 Seconds sliding window for fast environmental changes
  },
  thresholds: {
    heart: {
      low: 50,              // Bradycardia threshold
      high: 120,            // Elevated heart rate
      criticalHigh: 160,    // Critical tachycardia limit
    },
    spo2: {
      low: 94,              // Early desaturation indicator
      critical: 90,         // Severe Hypoxia limit
    },
    gas: {
      warning: 400,         // Initial anomalous gas density baseline
      critical: 800,        // Dangerous density threshold
    },
  },
};