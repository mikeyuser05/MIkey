export interface ITrendConfig {
  minDataPointsForTrend: number;
  significantDeltas: {
    heartRate: number; // bpm change to trigger RISING/FALLING
    spo2: number;      // % change to trigger RISING/FALLING
    gas: number;       // raw unit change to trigger RISING/FALLING
  };
  trendWindowSizeMs: number;
}

export const DEFAULT_TREND_CONFIG: ITrendConfig = {
  minDataPointsForTrend: 5,
  significantDeltas: {
    heartRate: 5.0,
    spo2: 1.0,
    gas: 50.0,
  },
  trendWindowSizeMs: 300000, // 5-minute historical trend window evaluation
};\n