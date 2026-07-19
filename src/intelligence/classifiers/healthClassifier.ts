import { HeartState, SpO2State, GasState, IClassifiedHealthStates } from '../types/health';

/**
 * Combines independent sensor state evaluations into a single classified object.
 */
export const classifyHealthStates = (
  timestamp: number,
  heartState: HeartState,
  spo2State: SpO2State,
  gasState: GasState
): IClassifiedHealthStates => {
  return {
    timestamp,
    heartState,
    spo2State,
    gasState
  };
};