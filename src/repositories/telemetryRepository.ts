/**
 * NOEXCUSE HPO V2: PR4.11.3 Telemetry Repository Mock Ingestion Stream
 * Simulates real-time hardware data updates coming from ESP32 wearable devices.
 */

import { IRawTelemetryFrame } from '../intelligence/pipeline/pipelineTypes';

export type TelemetryStreamCallback = (frame: IRawTelemetryFrame) => void;

export class TelemetryRepository {
  private static instance: TelemetryRepository | null = null;
  private listeners: Set<TelemetryStreamCallback> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.startMockHardwareStreaming();
  }

  public static getInstance(): TelemetryRepository {
    if (!this.instance) {
      this.instance = new TelemetryRepository();
    }
    return this.instance;
  }

  /**
   * Downstream components subscribe to the raw ingestion network layer here.
   */
  public subscribeToRawStream(callback: TelemetryStreamCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Generates periodic hardware telemetry frames matching physiological variables.
   */
  private startMockHardwareStreaming(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const frame: IRawTelemetryFrame = {
        deviceId: "ESP32_WEARABLE_PR1",
        timestamp: Date.now(),
        heartRate: 72 + Math.floor(Math.random() * 15), // Normal variance range
        spo2: 98 - Math.floor(Math.random() * 3),      // Stable saturation range
        gasConcentration: 120 + Math.floor(Math.random() * 50), // Safe environment
        rawAcceleration: {
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random() * 2 - 1
        }
      };

      this.listeners.forEach(cb => cb(frame));
    }, 1000); // 1 Hz hardware sampling frequency standard
  }

  public terminateStream(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}