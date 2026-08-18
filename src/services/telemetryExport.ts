import { TelemetryBufferPoint } from '../types/telemetry';

export class TelemetryExporter {
  public static exportToCSV(data: TelemetryBufferPoint[], filenamePrefix: string = 'hpo_telemetry'): void {
    if (!data || data.length === 0) {
      alert('No telemetry data available to export.');
      return;
    }

    const headers = ['Timestamp', 'ISO Time', 'Heart Rate (BPM)', 'SpO2 (%)', 'MQ-9 Gas (PPM)'];
    const rows = data.map(pt => [
      pt.timestamp,
      new Date(pt.timestamp).toISOString(),
      pt.heartRate,
      pt.spo2,
      pt.gasPpm
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${filenamePrefix}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  }

  public static exportToJSON(data: TelemetryBufferPoint[], filenamePrefix: string = 'hpo_telemetry'): void {
    if (!data || data.length === 0) {
      alert('No telemetry data available to export.');
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filenamePrefix}_${Date.now()}.json`, 'application/json');
  }

  private static downloadFile(content: string, fileName: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}