import { TelemetryMetrics } from '@/services/analyticsDataAdapter';

export class ExportService {
  public static exportToJSON(data: TelemetryMetrics[], filename: string = 'telemetry_export.json'): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
