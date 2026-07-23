/**
 * @file baselineCollector.ts
 * @description SQI-gated telemetry buffering and empirical baseline calculation engine.
 */

import { TelemetryReadingInput } from '../../types/sqi';
import { SQIEngine } from '../sqi/sqiEngine';
import { SampleReading, EmpiricBaselineResult } from '../../types/baselineEngine';

const BASELINE_BUFFER_STORAGE_KEY = 'noexcuse_hpo_baseline_buffer_v1';
const MAX_BUFFER_CAPACITY = 1000;
const MIN_SAMPLES_FOR_CALIBRATION = 10;

export class BaselineCollector {
  private static buffer: SampleReading[] | null = null;

  public static getBuffer(): SampleReading[] {
    if (this.buffer) {
      return this.buffer;
    }
    try {
      const raw = localStorage.getItem(BASELINE_BUFFER_STORAGE_KEY);
      if (raw) {
        this.buffer = JSON.parse(raw);
        return this.buffer || [];
      }
    } catch (err) {
      console.warn('[BaselineCollector] Failed to read baseline buffer:', err);
    }
    this.buffer = [];
    return this.buffer;
  }

  private static persistBuffer(): void {
    try {
      localStorage.setItem(BASELINE_BUFFER_STORAGE_KEY, JSON.stringify(this.buffer || []));
    } catch (err) {
      console.error('[BaselineCollector] Failed to persist baseline buffer:', err);
    }
  }

  public static ingestReading(current: TelemetryReadingInput, previous?: TelemetryReadingInput | null, nowMs: number = Date.now()): boolean {
    const sqi = SQIEngine.evaluate(current, previous, nowMs);

    if (!sqi.isValidForBaseline) {
      return false;
    }

    const sample: SampleReading = {
      timestampMs: current.timestampMs,
      heartRate: current.heartRate!,
      spO2: current.spO2!,
    };

    const currentBuffer = this.getBuffer();
    currentBuffer.push(sample);

    if (currentBuffer.length > MAX_BUFFER_CAPACITY) {
      currentBuffer.shift();
    }

    this.persistBuffer();
    return true;
  }

  public static clearBuffer(): void {
    this.buffer = [];
    localStorage.removeItem(BASELINE_BUFFER_STORAGE_KEY);
  }

  public static calculateEmpiricalBaseline(nowMs: number = Date.now()): EmpiricBaselineResult {
    const samples = this.getBuffer();
    const count = samples.length;

    if (count === 0) {
      return {
        empiricalRHR: 70,
        empiricalSpO2: 98,
        hrStdDev: 0,
        spO2StdDev: 0,
        sampleCount: 0,
        confidenceScore: 0,
        isCalibrated: false,
        lastUpdatedIso: new Date(nowMs).toISOString(),
      };
    }

    const hrSum = samples.reduce((acc, s) => acc + s.heartRate, 0);
    const spO2Sum = samples.reduce((acc, s) => acc + s.spO2, 0);
    const meanHR = Math.round(hrSum / count);
    const meanSpO2 = Math.round((spO2Sum / count) * 10) / 10;

    const hrVar = samples.reduce((acc, s) => acc + Math.pow(s.heartRate - meanHR, 2), 0) / count;
    const spO2Var = samples.reduce((acc, s) => acc + Math.pow(s.spO2 - meanSpO2, 2), 0) / count;
    const hrStdDev = Math.round(Math.sqrt(hrVar) * 10) / 10;
    const spO2StdDev = Math.round(Math.sqrt(spO2Var) * 10) / 10;

    const densityRatio = Math.min(1.0, count / (MIN_SAMPLES_FOR_CALIBRATION * 5));
    const variancePenalty = hrStdDev > 15 ? 0.2 : 0.0;
    const confidenceScore = Math.max(0, Math.round((densityRatio - variancePenalty) * 100));

    const isCalibrated = count >= MIN_SAMPLES_FOR_CALIBRATION && confidenceScore >= 50;

    return {
      empiricalRHR: meanHR,
      empiricalSpO2: meanSpO2,
      hrStdDev,
      spO2StdDev,
      sampleCount: count,
      confidenceScore,
      isCalibrated,
      lastUpdatedIso: new Date(nowMs).toISOString(),
    };
  }
}
