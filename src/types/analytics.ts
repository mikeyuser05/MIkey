export interface BaselineConfig {
  heartRateMin?: number;
  heartRateMax?: number;
  spo2Min?: number;
  gasThreshold?: number;
}

export interface BaselineBounds {
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  gasThreshold: number;
}

export class ContextualBaselineEngine {
  private config: BaselineBounds;

  constructor(config?: BaselineConfig) {
    this.config = {
      heartRateMin: config?.heartRateMin ?? 60,
      heartRateMax: config?.heartRateMax ?? 100,
      spo2Min: config?.spo2Min ?? 95,
      gasThreshold: config?.gasThreshold ?? 400,
    };
  }

  public calculateBaseline(_timestamp: number): BaselineBounds {
    return { ...this.config };
  }
}
