import { RiskSeverity } from '../types/risks';

export interface IRiskConfig {
  thresholds: {
    heartRate: {
      bradycardiaMin: number;
      tachycardiaMax: number;
      criticalTachycardiaMax: number;
    };
    spo2: {
      hypoxiaWarningMax: number;
      hypoxiaCriticalMax: number;
    };
    gas: {
      hazardousMin: number;
      lethalMin: number;
    };
  };
  persistenceWindowsMs: Record<RiskSeverity, number>;
}

export const DEFAULT_RISK_CONFIG: IRiskConfig = {
  thresholds: {
    heartRate: {
      bradycardiaMin: 50,
      tachycardiaMax: 100,
      criticalTachycardiaMax: 140,
    },
    spo2: {
      hypoxiaWarningMax: 94,
      hypoxiaCriticalMax: 88,
    },
    gas: {
      hazardousMin: 400,
      lethalMin: 800,
    }
  },
  persistenceWindowsMs: {
    NONE: 0,
    LOW: 5000,
    MEDIUM: 10000,
    HIGH: 15000,
    CRITICAL: 5000, // Shorter window for critical response validation
  }
};\n