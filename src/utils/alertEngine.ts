import { auditLogger } from '../services/auditLogger';

export interface AnomalyReport {
  isHeartRateAnomalous: boolean;
  isSpo2Anomalous: boolean;
  isGasAnomalous: boolean;
  heartRate: number;
  spo2: number;
  gas: number;
}

export class AlertEngine {
  public evaluateAlerts(report: AnomalyReport): void {
    if (report.isGasAnomalous) {
      auditLogger.log('GAS_EXCEEDED', `Hazardous gas level: ${report.gas} PPM`, 'CRITICAL');
    }
    if (report.isSpo2Anomalous) {
      auditLogger.log('SPO2_DROPPED', `Low oxygen saturation: ${report.spo2}%`, 'WARNING');
    }
    if (report.isHeartRateAnomalous) {
      auditLogger.log('HR_ANOMALY', `Abnormal heart rate: ${report.heartRate} bpm`, 'WARNING');
    }
  }
}

export const alertEngine = new AlertEngine();
