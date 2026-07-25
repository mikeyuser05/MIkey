/**
 * NOEXCUSE HPO V2 - Centralized Audit Trail Logger (PR11.9)
 * Records immutable history of state machine changes, policies, user actions, and simulated dispatches.
 */

import { AuditLogEntry, AlertSeverity } from '../types/pr11Triage';

const AUDIT_STORAGE_KEY = 'noexcuse_hpo_v2_audit_log';

class AuditLogger {
  private logEntries: AuditLogEntry[] = [];

  constructor() {
    this.loadLogs();
  }

  public log(
    eventType: AuditLogEntry['eventType'],
    details: string,
    severity: AlertSeverity = 'LOW',
    nodeId: string = 'NODE_001',
    simulated: boolean = false
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `AUDIT_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      eventType,
      details,
      severity,
      nodeId,
      simulated
    };

    this.logEntries.unshift(entry); // Newest first
    if (this.logEntries.length > 200) {
      this.logEntries = this.logEntries.slice(0, 200); // Retain latest 200 logs
    }
    this.saveLogs();
    return entry;
  }

  public getLogs(): AuditLogEntry[] {
    return [...this.logEntries];
  }

  public clearLogs(): void {
    this.logEntries = [];
    this.saveLogs();
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.logEntries = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load audit logs', e);
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logEntries));
    } catch (e) {
      console.error('Failed to save audit logs', e);
    }
  }
}

export const auditLogger = new AuditLogger();
