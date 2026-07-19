import { ISingleRiskAssessment, RiskSeverity } from '../types/risks';
import { IRiskConfig } from '../config/riskConfig';

/**
 * Evaluates isolated cardiovascular risk rules based on pure telemetry parameters.
 */
export const evaluateHeartRisk = (
  heartRate: number,
  config: IRiskConfig
): ISingleRiskAssessment => {
  const sourceRules: string[] = [];
  let severity: RiskSeverity = 'NONE';

  if (heartRate >= config.thresholds.heartRate.criticalTachycardiaMax) {
    severity = 'CRITICAL';
    sourceRules.push('CRITICAL_TACHYCARDIA_THRESHOLD_EXCEEDED');
  } else if (heartRate >= config.thresholds.heartRate.tachycardiaMax) {
    severity = 'HIGH';
    sourceRules.push('TACHYCARDIA_THRESHOLD_EXCEEDED');
  } else if (heartRate <= config.thresholds.heartRate.bradycardiaMin && heartRate > 0) {
    severity = 'MEDIUM';
    sourceRules.push('BRADYCARDIA_THRESHOLD_BREACHED');
  }

  return {
    category: 'CARDIOVASCULAR',
    severity,
    sourceRules,
    calculatedValue: heartRate
  };
};

/**
 * Evaluates isolated respiratory risk rules based on oxygen saturation bounds.
 */
export const evaluateSpO2Risk = (
  spo2: number,
  config: IRiskConfig
): ISingleRiskAssessment => {
  const sourceRules: string[] = [];
  let severity: RiskSeverity = 'NONE';

  if (spo2 <= config.thresholds.spo2.hypoxiaCriticalMax && spo2 > 0) {
    severity = 'CRITICAL';
    sourceRules.push('CRITICAL_HYPOXIA_BREACH');
  } else if (spo2 <= config.thresholds.spo2.hypoxiaWarningMax && spo2 > 0) {
    severity = 'HIGH';
    sourceRules.push('HYPOXIA_WARNING_BREACH');
  }

  return {
    category: 'RESPIRATORY',
    severity,
    sourceRules,
    calculatedValue: spo2
  };
};

/**
 * Evaluates isolated gas density metric bounds to extract environmental hazards.
 */
export const evaluateGasRisk = (
  gas: number,
  config: IRiskConfig
): ISingleRiskAssessment => {
  const sourceRules: string[] = [];
  let severity: RiskSeverity = 'NONE';

  if (gas >= config.thresholds.gas.lethalMin) {
    severity = 'CRITICAL';
    sourceRules.push('LETHAL_GAS_CONCENTRATION_DETECTED');
  } else if (gas >= config.thresholds.gas.hazardousMin) {
    severity = 'HIGH';
    sourceRules.push('HAZARDOUS_GAS_CONCENTRATION_DETECTED');
  }

  return {
    category: 'ENVIRONMENTAL',
    severity,
    sourceRules,
    calculatedValue: gas
  };
};