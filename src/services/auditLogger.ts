export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'LOW' | 'MODERATE';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: string;
  severity: AuditSeverity;
  details: string;
  actor?: string;
  eventType?: string;
  nodeId?: string;
  simulated?: boolean;
}

class AuditLoggerService {
  private logs: AuditLogEntry[] = [];

  log(
    action: string,
    details: string,
    severity: AuditSeverity = 'INFO',
    actorOrNodeId: string = 'System Engine',
    simulated: boolean = false
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      action,
      severity,
      details,
      actor: actorOrNodeId,
      nodeId: actorOrNodeId,
      simulated,
    };
    this.logs.unshift(entry);
    return entry;
  }

  getLogs(): AuditLogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const auditLogger = new AuditLoggerService();