export class ExportService { static exportToCSV(f: string, r: any[]): void {}
static exportToJSON(f: string, rep: any): void {}
static triggerPrintPDF(): void { window.print(); } }