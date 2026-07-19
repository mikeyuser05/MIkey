import { IReportEngine, IPeriodicReport, ReportType } from '../types/reports';
import { IReportConfig, DEFAULT_REPORT_CONFIG } from '../config/reportConfig';
import { buildWeeklyReport } from './weeklyReportBuilder';
import { buildMonthlyReport } from './monthlyReportBuilder';

/**
 * Coordination and orchestration pipeline layer for Periodic AI Reports (PR4.7).
 * Integrates daily snapshot pipelines into unified deterministic reports.
 */
export class ReportEngine implements IReportEngine {
  private config: IReportConfig;

  constructor(config: IReportConfig = DEFAULT_REPORT_CONFIG) {
    this.config = config;
  }

  /**
   * Routes telemetry summaries into weekly or monthly builders based on structural intervals.
   */
  public generatePeriodicReport(
    type: ReportType,
    dailySummaries: Array<{
      timestamp: number;
      metricsSnapshot: { heartRate: number; spo2: number; gas: number };
      healthScore: number;
      alertCount: number;
      riskCategories: string[];
    }>,
    startTimestamp: number,
    endTimestamp: number
  ): IPeriodicReport {
    
    // Sort input summaries by timestamp chronologically to ensure analytical consistency
    const sortedSummaries = [...dailySummaries].sort((a, b) => a.timestamp - b.timestamp);

    if (type === 'WEEKLY') {
      return buildWeeklyReport(
        sortedSummaries,
        startTimestamp,
        endTimestamp,
        this.config
      );
    }

    if (type === 'MONTHLY') {
      return buildMonthlyReport(
        sortedSummaries,
        startTimestamp,
        endTimestamp,
        this.config
      );
    }

    throw new Error(`Unsupported periodic report type scope execution context: ${type}`);
  }
}\n