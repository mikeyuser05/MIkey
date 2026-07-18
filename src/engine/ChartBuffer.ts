import { ChartDataPoint } from '../types/chart.types';
import { DataWindow } from './DataWindow';

export class ChartBuffer {
  private buffer: ChartDataPoint[] = [];
  private dataWindow: DataWindow;

  constructor(windowSize: any) { this.dataWindow = new DataWindow(windowSize); }
  public push(value: number, timestamp: number, formattedTime: string): void {
    this.buffer.push({ timestamp, formattedTime, value });
    this.prune(timestamp);
  }
  public prune(currentTimestamp: number): void {
    const cutoff = this.dataWindow.getCutoffTimestamp(currentTimestamp);
    this.buffer = this.buffer.filter(point => point.timestamp >= cutoff);
  }
  public getPoints(): ChartDataPoint[] { return [...this.buffer]; }
  public clear(): void { this.buffer = []; }
}