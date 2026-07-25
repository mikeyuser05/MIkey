/**
 * NOEXCUSE HPO V2 - Deterministic Alert Engine
 * Evaluates raw telemetry snapshots against unified thresholds & data quality rules.
 */

import { RawTelemetrySnapshot, AlertEvaluationResult, AlertSeverity, AlertCategory } from '../types/pr11Triage';
import { inspectDataQuality } from '../utils/dataQualityInspector';
import { ALERT_THRESHOLDS } from '../config/alertThresholds';

export function evaluateTelemetrySnapshot(
  snapshot: RawTelemetrySnapshot,
  currentTimeMs: number = Date.now()
): AlertEvaluationResult[] {
  const results: AlertEvaluationResult[] = [];
  const quality = inspectDataQuality(snapshot, currentTimeMs);

  // If telemetry has hardware/comms issues, produce quality alert and abort physiological evaluation
  if (quality !== 'VALID') {
    results.push({
      id: `QUAL_${snapshot.nodeId}_${currentTimeMs}`,
      category: 'COMMUNICATION',
      severity: quality === 'STALE' ? 'MODERATE' : 'LOW',
      state: 'WARNING',
      quality,
      metricValue: null,
      thresholdValue: null,
      reason: getQualityReasonMessage(quality),
      detectedAt: currentTimeMs,
      durationMs: 0,
      nodeId: snapshot.nodeId
    });
    return results;
  }

  // 1. Evaluate Heart Rate
  if (snapshot.heartRate !== undefined) {
    const hr = snapshot.heartRate;
    const cfg = ALERT_THRESHOLDS.HEART_RATE;

    if (cfg.criticalHigh && hr >= cfg.criticalHigh) {
      results.push(createResult('PHYSIOLOGICAL_HR', 'CRITICAL', hr, cfg.criticalHigh, `Critical Tachycardia detected: ${hr} BPM`, snapshot, currentTimeMs));
    } else if (cfg.criticalLow && hr <= cfg.criticalLow) {
      results.push(createResult('PHYSIOLOGICAL_HR', 'CRITICAL', hr, cfg.criticalLow, `Critical Bradycardia detected: ${hr} BPM`, snapshot, currentTimeMs));
    } else if (hr >= cfg.high) {
      results.push(createResult('PHYSIOLOGICAL_HR', 'MODERATE', hr, cfg.high, `High Heart Rate detected: ${hr} BPM`, snapshot, currentTimeMs));
    } else if (hr <= cfg.low) {
      results.push(createResult('PHYSIOLOGICAL_HR', 'LOW', hr, cfg.low, `Low Heart Rate detected: ${hr} BPM`, snapshot, currentTimeMs));
    }
  }

  // 2. Evaluate SpO2
  if (snapshot.spo2 !== undefined) {
    const spo2 = snapshot.spo2;
    const cfg = ALERT_THRESHOLDS.SPO2;

    if (cfg.criticalLow && spo2 <= cfg.criticalLow) {
      results.push(createResult('PHYSIOLOGICAL_SPO2', 'CRITICAL', spo2, cfg.criticalLow, `Critical Hypoxia detected: SpO2 ${spo2}%`, snapshot, currentTimeMs));
    } else if (spo2 <= cfg.low) {
      results.push(createResult('PHYSIOLOGICAL_SPO2', 'MODERATE', spo2, cfg.low, `Low Oxygen Saturation detected: SpO2 ${spo2}%`, snapshot, currentTimeMs));
    }
  }

  // 3. Evaluate Environmental Gas (MQ-9)
  if (snapshot.gasPpm !== undefined) {
    const gas = snapshot.gasPpm;
    const cfg = ALERT_THRESHOLDS.GAS_PPM;

    if (cfg.criticalHigh && gas >= cfg.criticalHigh) {
      results.push(createResult('ENVIRONMENTAL_GAS', 'CRITICAL', gas, cfg.criticalHigh, `Hazardous Gas Level: ${gas} PPM`, snapshot, currentTimeMs));
    } else if (gas >= cfg.high) {
      results.push(createResult('ENVIRONMENTAL_GAS', 'MODERATE', gas, cfg.high, `Elevated Gas Level: ${gas} PPM`, snapshot, currentTimeMs));
    }
  }

  // If no thresholds breached, return normal operational evaluation
  if (results.length === 0) {
    results.push({
      id: `NORM_${snapshot.nodeId}_${currentTimeMs}`,
      category: 'PHYSIOLOGICAL_HR',
      severity: 'LOW',
      state: 'NORMAL',
      quality: 'VALID',
      metricValue: null,
      thresholdValue: null,
      reason: 'All monitored metrics within normal physiological limits',
      detectedAt: currentTimeMs,
      durationMs: 0,
      nodeId: snapshot.nodeId
    });
  }

  return results;
}

function createResult(
  category: AlertCategory,
  severity: AlertSeverity,
  val: number,
  thresh: number,
  reason: string,
  snapshot: RawTelemetrySnapshot,
  currentTimeMs: number
): AlertEvaluationResult {
  return {
    id: `EVAL_${category}_${snapshot.nodeId}_${currentTimeMs}`,
    category,
    severity,
    state: severity === 'CRITICAL' ? 'ESCALATING' : 'WARNING',
    quality: 'VALID',
    metricValue: val,
    thresholdValue: thresh,
    reason,
    detectedAt: currentTimeMs,
    durationMs: 0,
    nodeId: snapshot.nodeId
  };
}

function getQualityReasonMessage(quality: string): string {
  switch (quality) {
    case 'STALE': return 'Telemetry data is stale (>10s latency)';
    case 'MISSING': return 'Telemetry stream payload missing';
    case 'SENSOR_ERROR': return 'Sensor hardware reported invalid zero output or communication failure';
    case 'INVALID': return 'Metric values outside physically plausible bounds';
    default: return 'Telemetry degradation detected';
  }
}
