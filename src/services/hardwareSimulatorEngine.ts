/**
 * NOEXCUSE HPO V2 - Hardware Sensor Simulator Engine (PR14)
 * Synthesizes realistic biometric waveforms and injects hardware fault modes.
 */

import { VirtualSensorConfig, SyntheticWaveframe, SensorFaultType } from '../types/pr14Simulator';
import { TelemetrySnapshot } from '../types/pr11Triage';
import { GPSTelemetry } from '../types/pr12Geo';

export class HardwareSimulatorEngine {
  private config: VirtualSensorConfig = {
    baseHeartRate: 72,
    baseSpO2: 98,
    baseGasPpm: 120,
    motionIntensity: 0.1,
    noiseLevel: 0.05,
    activeFault: 'NONE',
    batteryPercent: 88,
    transmissionRateHz: 1
  };

  private phaseAngle = 0;

  public updateConfig(newConfig: Partial<VirtualSensorConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): VirtualSensorConfig {
    return { ...this.config };
  }

  public setFault(fault: SensorFaultType): void {
    this.config.activeFault = fault;
  }

  public generateWaveframe(currentTime: number = Date.now()): SyntheticWaveframe {
    const { baseHeartRate, motionIntensity, noiseLevel, activeFault, batteryPercent } = this.config;

    // Synthesize Heart Rate PPG Waveform (Sinusoidal + Harmonic)
    const hrFreqHz = baseHeartRate / 60;
    this.phaseAngle += (2 * Math.PI * hrFreqHz * 0.1);
    
    let ppg = Math.sin(this.phaseAngle) + 0.3 * Math.sin(2 * this.phaseAngle);
    if (activeFault === 'MAX30100_DISCONNECT') {
      ppg = 0;
    } else {
      ppg += (Math.random() - 0.5) * noiseLevel * 2;
    }

    // Gas Sensor Voltage Simulation
    let gasRaw = this.config.baseGasPpm * 4;
    if (activeFault === 'MQ9_HEATER_FAULT') {
      gasRaw = 1023; // Saturate high
    } else {
      gasRaw += (Math.random() - 0.5) * 20;
    }

    // Accelerometer Vector Simulation
    let accelX = (Math.random() - 0.5) * motionIntensity * 2;
    let accelY = (Math.random() - 0.5) * motionIntensity * 2;
    let accelZ = 9.81 + (Math.random() - 0.5) * motionIntensity;

    if (activeFault === 'BMI270_ACCEL_FREEZE') {
      accelX = 0; accelY = 0; accelZ = 0;
    }

    return {
      timestamp: currentTime,
      ppgValue: parseFloat(ppg.toFixed(3)),
      gasAnalogRaw: Math.round(gasRaw),
      accelX: parseFloat(accelX.toFixed(2)),
      accelY: parseFloat(accelY.toFixed(2)),
      accelZ: parseFloat(accelZ.toFixed(2)),
      batteryPercent: activeFault === 'BATTERY_CRITICAL_DROP' ? 3 : batteryPercent,
      faultActive: activeFault !== 'NONE'
    };
  }

  public generateTelemetrySnapshot(nodeId: string = 'NODE_SIM_LAB', currentTime: number = Date.now()): TelemetrySnapshot {
    const { baseHeartRate, baseSpO2, activeFault, batteryPercent } = this.config;
    const isSensorError = activeFault === 'MAX30100_DISCONNECT' || activeFault === 'MQ9_HEATER_FAULT';

    return {
      nodeId,
      heartRate: activeFault === 'MAX30100_DISCONNECT' ? 0 : baseHeartRate + Math.round((Math.random() - 0.5) * 4),
      spO2: activeFault === 'MAX30100_DISCONNECT' ? 0 : Math.max(70, Math.min(100, baseSpO2 + Math.round((Math.random() - 0.5) * 2))),
      mq9GasRaw: activeFault === 'MQ9_HEATER_FAULT' ? 1023 : Math.round(this.config.baseGasPpm * 4),
      batteryPercent: activeFault === 'BATTERY_CRITICAL_DROP' ? 3 : batteryPercent,
      latencyMs: activeFault === 'HIGH_PACKET_LOSS' ? 1800 : Math.round(45 + Math.random() * 30),
      sensorError: isSensorError,
      timestamp: currentTime
    };
  }

  public generateGPSTelemetry(currentTime: number = Date.now()): GPSTelemetry {
    const { activeFault } = this.config;
    const hasLock = activeFault !== 'GPS_LOCK_LOST';

    return {
      latitude: 26.4491,
      longitude: 74.6321,
      accuracyMeters: hasLock ? 4.5 : 120.0,
      satellites: hasLock ? 9 : 2,
      hasFix: hasLock,
      timestamp: currentTime
    };
  }
}

export const hardwareSimulatorEngine = new HardwareSimulatorEngine();
