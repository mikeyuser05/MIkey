/**
 * NOEXCUSE HPO V2 - Telemetry SQI Stream Filter
 * Filters and validates telemetry samples before passing them to baseline calculators.
 */

import { SQIEngine, TelemetryPoint, defaultSQIEngine } from './sqiEngine';
import { SQIEvaluationResult } from '../../types/sqi';

export interface ValidatedTelemetryPacket {
  raw: TelemetryPoint;
  sqi: SQIEvaluationResult;
}

export class SQIFilter {
  private engine: SQIEngine;
  private lastEvaluatedPoint: TelemetryPoint | null = null;

  constructor(engine: SQIEngine = defaultSQIEngine) {
    this.engine = engine;
  }

  /**
   * Processes an incoming telemetry point and attaches SQI evaluation.
   */
  public process(point: TelemetryPoint, nowMs?: number): ValidatedTelemetryPacket {
    const sqi = this.engine.evaluateSample(point, this.lastEvaluatedPoint, nowMs);
    
    // Only update reference point if the current sample wasn't an impossible spike
    if (!sqi.heartRateQuality.flags.includes('IMPOSSIBLE_VALUE')) {
      this.lastEvaluatedPoint = point;
    }

    return { raw: point, sqi };
  }

  /**
   * Filters an array of raw telemetry batch points, keeping only those usable for baseline engine.
   */
  public filterValidForBaselines(points: TelemetryPoint[], nowMs?: number): TelemetryPoint[] {
    const result: TelemetryPoint[] = [];
    let prev: TelemetryPoint | null = null;

    for (const pt of points) {
      const sqi = this.engine.evaluateSample(pt, prev, nowMs);
      if (sqi.isUsableForBaselines) {
        result.push(pt);
        prev = pt;
      }
    }

    return result;
  }

  public reset(): void {
    this.lastEvaluatedPoint = null;
  }
}
