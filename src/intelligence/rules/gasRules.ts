import { IRawTelemetry, GasState } from '../types/health';
import { IEngineConfig } from '../config/engineConfig';

/**
 * Pure deterministic rule engine evaluating Unified Gas Concentration states.
 * Evaluates raw environmental ppm feedback over the active temporal window.
 */
export const evaluateGasRules = (
  windowData: IRawTelemetry[],
  config: IEngineConfig
): GasState => {
  if (!windowData || windowData.length === 0) {
    return 'NORMAL';
  }

  const latestFrame = windowData[windowData.length - 1];
  const currentGas = latestFrame.gas;
  const limits = config.thresholds.gas;

  if (currentGas >= limits.critical) {
    return 'CRITICAL';
  }
  if (currentGas >= limits.warning) {
    return 'WARNING';
  }

  return 'NORMAL';
};