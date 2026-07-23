/**
 * PR6.7: Analytics Export Types
 */

import { TimeBucket } from "./analytics";

export type ExportFormat = "JSON" | "CSV";

export interface ExportOptions {
    userId: string;
    bucketType?: TimeBucket;
    startIso?: string;
    endIso?: string;
    format: ExportFormat;
}

export interface ExportResult {
    fileName: string;
    mimeType: string;
    content: string;
    recordCount: number;
    exportedAt: number;
}
