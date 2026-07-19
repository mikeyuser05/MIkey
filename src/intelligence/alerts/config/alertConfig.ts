import { AlertPriority } from '../types/alerts';

export interface IAlertConfig {
  cooldownPeriodsMs: Record<AlertPriority, number>;
  escalationThresholdsMs: {
    warningToHighMs: number;
    highToEmergencyMs: number;
  };
}

export const DEFAULT_ALERT_CONFIG: IAlertConfig = {
  cooldownPeriodsMs: {
    NONE: 0,
    INFO: 60000,       // 1 Minute
    WARNING: 45000,    // 45 Seconds
    HIGH: 15000,       // 15 Seconds
    EMERGENCY: 5000,   // 5 Seconds rapid re-alerting window
  },
  escalationThresholdsMs: {
    warningToHighMs: 30000,    // Sustained warning transforms to high after 30s
    highToEmergencyMs: 20000,  // Sustained high transforms to emergency after 20s
  }
};