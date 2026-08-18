import { TelemetryData, TelemetryBufferPoint } from '../types/telemetry';

/**
 * 60-Second Rolling Window Telemetry Buffer
 * Manages live samples without memory leaks, synthetic data, or redundant state triggers.
 */
export class TelemetryBuffer {
  private buffer: TelemetryBufferPoint[] = [];
  private readonly maxWindowMs: number;

  constructor(windowSeconds: number = 60) {
    this.maxWindowMs = windowSeconds * 1000;
  }

  public push(sample: TelemetryData): TelemetryBufferPoint[] {
    if (!sample || typeof sample.timestamp !== 'number') {
      return this.buffer;
    }

    const now = sample.timestamp;
    const dateObj = new Date(now);
    const timeLabel = dateObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const point: TelemetryBufferPoint = {
      timeLabel,
      timestamp: now,
      heartRate: Number.isFinite(sample.heartRate) ? sample.heartRate : 0,
      spo2: Number.isFinite(sample.spo2) ? sample.spo2 : 0,
      gasPpm: Number.isFinite(sample.gasPpm) ? sample.gasPpm : 0,
    };

    this.buffer.push(point);

    // Evict items older than rolling window cutoff
    const cutoff = now - this.maxWindowMs;
    while (this.buffer.length > 0 && this.buffer[0].timestamp < cutoff) {
      this.buffer.shift();
    }

    return [...this.buffer];
  }

  public getSnapshot(): TelemetryBufferPoint[] {
    return [...this.buffer];
  }

  public clear(): void {
    this.buffer = [];
  }
}
