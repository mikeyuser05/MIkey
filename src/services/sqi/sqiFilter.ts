/**
 * NOEXCUSE HPO V2 - Telemetry SQI Stream Filter
 */

import { SQIEngine } from './sqiEngine';
import { TelemetryReadingInput, SQIEvaluationResult } from '../../types/sqi';

export type TelemetryPoint = TelemetryReadingInput;

export interface ValidatedTelemetryPacket {
  raw: TelemetryPoint;
  sqi: SQIEvaluationResult;
}

export class SQIFilter {
  private lastEvaluatedPoint: TelemetryPoint | null = null;

  public process(point: TelemetryPoint, nowMs: number = Date.now()): ValidatedTelemetryPacket {
    const sqi = SQIEngine.evaluate(point, this.lastEvaluatedPoint, nowMs);

    if (sqi.isValidForBaseline) {
      this.lastEvaluatedPoint = point;
    }

    return {
      raw: point,
      sqi,
    };
  }
}

export const sqiFilter = new SQIFilter();
