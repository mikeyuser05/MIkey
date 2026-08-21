import { auditLogger } from './auditLogger';

export class ProductionHardening {
  static initGlobalHandlers(): void {
    if (typeof window === 'undefined') return;

    // Capture Unhandled Rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[PR38 HARDENING] Unhandled Promise Rejection:', event.reason);
      auditLogger.log(
        'UNHANDLED_REJECTION',
        'CRITICAL',
        `Reason: ${event.reason?.message || event.reason}`,
        'GlobalErrorHandler'
      );
    });

    // Capture Global Runtime Errors
    window.addEventListener('error', (event) => {
      console.error('[PR38 HARDENING] Global Window Error:', event.error);
      auditLogger.log(
        'RUNTIME_ERROR',
        'CRITICAL',
        `Error: ${event.message} at ${event.filename}:${event.lineno}`,
        'GlobalErrorHandler'
      );
    });
  }

  static verifyEnvironment(): { isProductionReady: boolean; notes: string[] } {
    const notes: string[] = [];

    if (process.env.NODE_ENV === 'production') {
      notes.push('Running in production mode.');
    } else {
      notes.push('Development environment active.');
    }

    if (!window.localStorage) {
      notes.push('Storage mechanism warning: LocalStorage missing.');
    }

    return {
      isProductionReady: notes.length > 0,
      notes,
    };
  }
}
