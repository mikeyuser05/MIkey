export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  actor: string;
  details: string;
}

const AUDIT_STORAGE_KEY = 'HPO_AUDIT_LOGS_PR38';

class AuditLogger {
  private logs: AuditLogEntry[] = [];

  constructor() {
    const saved = localStorage.getItem(AUDIT_STORAGE_KEY);
    this.logs = saved ? JSON.parse(saved) : [];
  }

  log(action: string, severity: 'INFO' | 'WARNING' | 'CRITICAL', details: string, actor = 'System Engine') {
    const newEntry: AuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      severity,
      actor,
      details,
    };

    this.logs.unshift(newEntry);
    
    // Maintain max 100 entries for memory optimization
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs));
  }

  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}

export const auditLogger = new AuditLogger();
