/**
 * NOEXCUSE HPO V2 - Centralized Alert Threshold Definitions
 * Single source of truth for physiological & environmental boundaries.
 */

export interface ThresholdConfig {
  low: number;
  criticalLow?: number;
  high: number;
  criticalHigh?: number;
  persistenceRequiredMs: number;
}

export const ALERT_THRESHOLDS: Record<string, ThresholdConfig> = {
  HEART_RATE: {
    low: 50,          // Bradycardia warning
    criticalLow: 40,  // Severe Bradycardia
    high: 110,        // Tachycardia warning
    criticalHigh: 140,// Severe Tachycardia
    persistenceRequiredMs: 15000, // 15s persistent reading required
  },
  SPO2: {
    low: 92,          // Mild Hypoxia
    criticalLow: 88,  // Critical Hypoxia
    high: 100,
    persistenceRequiredMs: 10000, // 10s persistent drop
  },
  GAS_PPM: {
    low: 300,         // Elevated gas presence
    high: 600,        // Hazardous level
    criticalHigh: 1000,// Severe toxic threshold
    persistenceRequiredMs: 5000,  // 5s rapid escalation
  }
};
