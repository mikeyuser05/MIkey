import { TimeWindowSize } from '../types/chartEngine.types';

export class DataWindow {
  private durationMs: number;
  constructor(windowSize: TimeWindowSize) {
    if (windowSize === '30s') this.durationMs = 30 * 1000;
    else if windowSize === '1m') this.durationMs = 60 * 1000;
    else this.durationMs = 5 * 60 * 1000;
  }
  public getCutoffTimestamp(currentTimestamp: number): number { return currentTimestamp - this.durationMs; }
}