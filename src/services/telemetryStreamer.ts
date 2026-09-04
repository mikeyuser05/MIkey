import { TelemetryMetrics } from '../services/analyticsDataAdapter';

type TelemetryListener = (data: TelemetryMetrics) => void;

export class TelemetryStreamer {
  private listeners: TelemetryListener[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  public subscribe(listener: TelemetryListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public startSimulation(intervalMs: number = 2000): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      const packet: TelemetryMetrics = {
        heartRate: Math.floor(65 + Math.random() * 25),
        spo2: Math.floor(95 + Math.random() * 4),
        gas: Math.floor(100 + Math.random() * 50),
        timestamp: Date.now(),
      };
      this.listeners.forEach((listener) => listener(packet));
    }, intervalMs);
  }

  public stopSimulation(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const telemetryStreamer = new TelemetryStreamer();
