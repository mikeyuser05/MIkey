/**
 * NOEXCUSE HPO V2: PR4.10.5 Production Validation & Telemetry Integrity Engine
 * Enforces strict runtime input verification, boundary constraints, and structural consistency checks.
 */

export interface IValidationResult {
  isValid: boolean;
  errors: string[];
}

export class DataValidationEngine {
  /**
   * Validates raw biometric frames coming from firmware components or data stores.
   * Ensures data stays within physiological boundaries before it hits analytics engines.
   */
  public static validateBiometricTelemetry(metrics: {
    heartRate?: number;
    spo2?: number;
    gas?: number;
  }): IValidationResult {
    const errors: string[] = [];

    if (metrics.heartRate !== undefined) {
      if (metrics.heartRate < 30 || metrics.heartRate > 250) {
        errors.push(`Physiological Out-of-Bounds: Heart Rate (${metrics.heartRate} bpm) violates acceptable limits [30-250].`);
      }
    }

    if (metrics.spo2 !== undefined) {
      if (metrics.spo2 < 50 || metrics.spo2 > 100) {
        errors.push(`Physiological Out-of-Bounds: SpO2 (${metrics.spo2}%) violates acceptable limits [50-100].`);
      }
    }

    if (metrics.gas !== undefined) {
      if (metrics.gas < 0 || metrics.gas > 10000) {
        errors.push(`Environmental Out-of-Bounds: Gas sensor concentration (${metrics.gas} ppm) violates sensor operational limits [0-10000].`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates internal application routing configurations for absolute engine consistency.
   */
  public static validateProviderConfig(config: {
    id: string;
    name: string;
    launchUrl: string;
  }): IValidationResult {
    const errors: string[] = [];

    if (!config.id || config.id.trim().length === 0) {
      errors.push("Structural Guard Violation: Provider Identifier cannot be empty or null.");
    }

    if (!config.launchUrl.startsWith("https://")) {
      errors.push(`Security Constraint Violation: External endpoint [${config.launchUrl}] must utilize a secure HTTPS channel.`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}\n