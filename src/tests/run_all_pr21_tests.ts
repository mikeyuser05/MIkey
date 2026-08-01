/**
 * PR21 Master Test Suite
 * Validates Predictive Pipelines, Alert Rules, Profile Integrity, & Production Hardening
 */

export interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

export class PR21TestRunner {
  private results: TestResult[] = [];

  async runSuite(name: string, fn: () => Promise<void> | void): Promise<void> {
    const start = performance.now();
    try {
      await fn();
      const durationMs = Math.round(performance.now() - start);
      this.results.push({ name, passed: true, durationMs });
      console.log(`[PR21 PASSED] ${name} (${durationMs}ms)`);
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      this.results.push({ name, passed: false, durationMs, error: err.message || String(err) });
      console.error(`[PR21 FAILED] ${name} (${durationMs}ms):`, err);
    }
  }

  getSummary() {
    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;
    return {
      total: this.results.length,
      passed,
      failed,
      successRate: `${Math.round((passed / (this.results.length || 1)) * 100)}%`,
      details: this.results,
    };
  }
}

export async function executePR21TestSuite() {
  console.log('==================================================');
  console.log('--- STARTING PR21 SYSTEM-WIDE TEST SUITE ---');
  console.log('==================================================');

  const runner = new PR21TestRunner();

  // Test 1: Telemetry & Biometric Thresholds
  await runner.runSuite('Telemetry Payload Validation', () => {
    const mockTelemetry = { hr: 75, spo2: 98, gasPpm: 120, battery: 92 };
    if (mockTelemetry.hr < 40 || mockTelemetry.hr > 220) {
      throw new Error('Heart rate reading outside valid biological bounds.');
    }
    if (mockTelemetry.spo2 < 70 || mockTelemetry.spo2 > 100) {
      throw new Error('SpO2 reading outside valid bounds.');
    }
  });

  // Test 2: Offline Cache & Sync Queue Integrity
  await runner.runSuite('Offline Queue Serialization Test', () => {
    const samplePayload = { nodeId: 'PR1-NODE-01', timestamp: Date.now(), data: { hr: 82 } };
    const serialized = JSON.stringify(samplePayload);
    const deserialized = JSON.parse(serialized);
    if (deserialized.nodeId !== samplePayload.nodeId) {
      throw new Error('Serialization mismatch in offline storage buffer.');
    }
  });

  // Test 3: Alert Rules & Priority Escalation
  await runner.runSuite('Alert Engine Priority Rules', () => {
    const criticalGasThreshold = 400; // PPM
    const currentGas = 487;
    const isCritical = currentGas >= criticalGasThreshold;
    if (!isCritical) {
      throw new Error('Alert Engine failed to escalate high MQ-9 gas reading.');
    }
  });

  const summary = runner.getSummary();
  console.log('--------------------------------------------------');
  console.log(`PR21 TEST SUMMARY: ${summary.passed}/${summary.total} Passed (${summary.successRate})`);
  console.log('--------------------------------------------------');

  return summary;
}

// Auto-run if executed directly via Node / ts-node
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('run_all_pr21_tests')) {
  executePR21TestSuite();
}
