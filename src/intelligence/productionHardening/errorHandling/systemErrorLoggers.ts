/**
 * NOEXCUSE HPO V2: PR4.10.4 Error Handling & Structural Recovery Architecture
 * Enforces standardized log capture patterns, fail-safe isolation, and cascading exception overrides.
 */

export type ErrorSeverity = 'ADVISORY' | 'RECOVERABLE' | 'FATAL';

export interface ISystemErrorContext {
  id: string;
  timestamp: number;
  subsystem: 'FIRMWARE_BRIDGE' | 'ANALYTICS_ENGINE' | 'INTEGRATION_LAYER' | 'DASHBOARD_UI';
  message: string;
  severity: ErrorSeverity;
  stackTrace?: string;
}

export class ProductionErrorCoordinator {
  private static errorHistory: ISystemErrorContext[] = [];
  private static subscribers: ((error: ISystemErrorContext) => void)[] = [];

  /**
   * Catches, sanitizes, and registers internal system runtime operational failures.
   */
  public static dispatchError(
    subsystem: ISystemErrorContext['subsystem'],
    message: string,
    severity: ErrorSeverity,
    errorInstance?: Error
  ): ISystemErrorContext {
    const errorContext: ISystemErrorContext = {
      id: `ERR_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      timestamp: Date.now(),
      subsystem,
      message,
      severity,
      stackTrace: errorInstance?.stack
    };

    this.errorHistory.push(errorContext);
    
    // Prevent history buffers from exhausting host platform memory boundaries
    if (this.errorHistory.length > 500) {
      this.errorHistory.shift();
    }

    // Alert presentation fallbacks or recovery managers instantly
    this.subscribers.forEach(cb => cb(errorContext));

    return errorContext;
  }

  /**
   * Subscribes to real-time telemetry error dispatch channels.
   */
  public static subscribeToFailures(callback: (error: ISystemErrorContext) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  /**
   * Executes functional fallback operations with deterministic target states.
   */
  public static executeWithFallback<T>(
    operation: () => T,
    fallbackValue: T,
    subsystem: ISystemErrorContext['subsystem'],
    contextMessage: string
  ): T {
    try {
      return operation();
    } catch (error: any) {
      this.dispatchError(subsystem, `${contextMessage}: ${error?.message || 'Unknown state Exception'}`, 'RECOVERABLE', error);
      return fallbackValue;
    }
  }

  public static getLogs(): ISystemErrorContext[] {
    return [...this.errorHistory];
  }

  public static wipeLogs(): void {
    this.errorHistory = [];
  }
}\n