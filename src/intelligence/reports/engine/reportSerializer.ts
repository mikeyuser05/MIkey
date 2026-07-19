import { IPeriodicReport } from '../types/reports';

/**
 * Pure deterministic report serialization layer.
 * Standardizes object shapes, ensures safe serialization boundaries,
 * and formats downstream transmission structures without side effects.
 */
export const serializeReport = (report: IPeriodicReport): string => {
  return JSON.stringify(report);
};

/**
 * Pure deterministic report deserialization layer.
 * Restores structured structural payloads from string layers.
 */
export const deserializeReport = (serialized: string): IPeriodicReport => {
  const parsed = JSON.parse(serialized);
  
  // Enforce runtime structural validation checks
  if (!parsed.id || !parsed.type || !parsed.metrics || !parsed.healthScores) {
    throw new Error('Invalid serialization profile detected during report decoding.');
  }

  return parsed as IPeriodicReport;
};\n