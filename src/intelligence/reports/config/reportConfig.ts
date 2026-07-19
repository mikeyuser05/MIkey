export interface IReportConfig {
  minDataPointsRequired: Record<'WEEKLY' | 'MONTHLY', number>;
  criticalGasThreshold: number;
  criticalSpo2Threshold: number;
}

export const DEFAULT_REPORT_CONFIG: IReportConfig = {
  minDataPointsRequired: {
    'WEEKLY': 5,     // Minimum daily summaries needed for a valid weekly view
    'MONTHLY': 20    // Minimum daily summaries needed for a valid monthly view
  },
  criticalGasThreshold: 800,
  criticalSpo2Threshold: 88
};\n