/**
 * NOEXCUSE HPO V2 - Telemetry Simulation Engine
 * Generates deterministic scenario snapshots passing through the unified pipeline.
 */

import { RawTelemetrySnapshot } from '../types/pr11Triage';

export type SimulationScenario = 
  | 'HEALTHY_BASELINE'
  | 'GAS_RISING'
  | 'CRITICAL_GAS'
  | 'SPO2_DROPPING'
  | 'CRITICAL_SPO2'
  | 'ABNORMAL_HR'
  | 'MISSING_HR'
  | 'STALE_TELEMETRY'
  | 'SENSOR_ERROR'
  | 'MULTIPLE_ABNORMALITIES';

export class SimulationEngine {
  private activeScenario: SimulationScenario = 'HEALTHY_BASELINE';
  private nodeId = 'NODE_SIM_01';

  public setScenario(scenario: SimulationScenario): void {
    this.activeScenario = scenario;
  }

  public getScenario(): SimulationScenario {
    return this.activeScenario;
  }

  public generateSnapshot(currentTimeMs: number = Date.now()): RawTelemetrySnapshot {
    switch (this.activeScenario) {
      case 'HEALTHY_BASELINE':
        return {
          heartRate: 72,
          spo2: 98,
          gasPpm: 120,
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'GAS_RISING':
        return {
          heartRate: 80,
          spo2: 97,
          gasPpm: 450, // Triggers MODERATE
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'CRITICAL_GAS':
        return {
          heartRate: 95,
          spo2: 95,
          gasPpm: 1200, // Triggers CRITICAL
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'SPO2_DROPPING':
        return {
          heartRate: 88,
          spo2: 90, // Triggers MODERATE
          gasPpm: 150,
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'CRITICAL_SPO2':
        return {
          heartRate: 110,
          spo2: 84, // Triggers CRITICAL
          gasPpm: 150,
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'ABNORMAL_HR':
        return {
          heartRate: 155, // Triggers Severe Tachycardia
          spo2: 96,
          gasPpm: 140,
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'MISSING_HR':
        return {
          heartRate: 0, // Triggers SENSOR_ERROR quality check
          spo2: 97,
          gasPpm: 130,
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'STALE_TELEMETRY':
        return {
          heartRate: 75,
          spo2: 98,
          gasPpm: 120,
          timestamp: currentTimeMs - 25000, // 25s latency -> STALE
          nodeId: this.nodeId
        };

      case 'SENSOR_ERROR':
        return {
          heartRate: undefined,
          spo2: 0,
          gasPpm: -10, // Invalid bounds
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      case 'MULTIPLE_ABNORMALITIES':
        return {
          heartRate: 145,
          spo2: 85,
          gasPpm: 1100,
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };

      default:
        return {
          heartRate: 72,
          spo2: 98,
          gasPpm: 120,
          timestamp: currentTimeMs,
          nodeId: this.nodeId
        };
    }
  }
}

export const simulationEngine = new SimulationEngine();
