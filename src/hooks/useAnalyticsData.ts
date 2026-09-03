import { useState, useEffect } from 'react';
import { analyticsAdapter, TelemetryMetrics } from '@/services/analyticsDataAdapter';

export function useAnalyticsData(rawTelemetry: TelemetryMetrics | null) {
  const [processedData, setProcessedData] = useState<ReturnType<typeof analyticsAdapter.processTelemetry> | null>(null);

  useEffect(() => {
    if (rawTelemetry) {
      const metrics = analyticsAdapter.processTelemetry(rawTelemetry);
      setProcessedData(metrics);
    }
  }, [rawTelemetry]);

  return { processedData };
}
