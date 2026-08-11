import { CallDecision } from '../types/triage';

export interface BackendCallExecutionResult {
  success: boolean;
  callSid?: string;
  provider: 'TWILIO' | 'MOCK';
  status: string;
  message: string;
  timestamp: number;
}

export class EmergencyVoiceBackendClient {
  private functionEndpoint: string;

  constructor() {
    // Uses environment configuration for API URL without holding secrets
    this.functionEndpoint =
      import.meta.env.VITE_EMERGENCY_CALL_FUNCTION_URL ||
      'http://127.0.0.1:5001/noexcuse-hpo/us-central1/initiateEmergencyCall';
  }

  public async requestOutboundCall(
    decision: CallDecision,
    targetPhone: string
  ): Promise<BackendCallExecutionResult> {
    // Client-side Gate Enforcement check
    if (decision.status !== 'CALL_ELIGIBLE') {
      return {
        success: false,
        provider: 'MOCK',
        status: 'blocked',
        message: `CLIENT_GATE_BLOCKED: Decision state is ${decision.status} (${decision.reasonCode}). Cannot request backend dispatch.`,
        timestamp: Date.now(),
      };
    }

    const payload = {
      requestId: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      eventId: decision.eventId || `evt_${Date.now()}`,
      targetPhone,
      severity: decision.severity,
      reasonCode: decision.reasonCode,
      timestamp: Date.now(),
    };

    try {
      const response = await fetch(this.functionEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: BackendCallExecutionResult = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: `NETWORK_ERROR: Failed to contact emergency voice backend (${error.message})`,
        timestamp: Date.now(),
      };
    }
  }
}

export const emergencyVoiceBackendClient = new EmergencyVoiceBackendClient();
