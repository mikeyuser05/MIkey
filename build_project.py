import os

files_to_create = {
    # 1. Server Types Contract
    "functions/src/types/voice.ts": """export type VoiceProviderType = 'TWILIO' | 'MOCK';

export type CallStatus = 'queued' | 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed';

export interface CallRequestPayload {
  requestId: string;
  eventId: string;
  targetPhone: string;
  severity: 'CRITICAL';
  reasonCode: string;
  authToken?: string;
  timestamp: number;
}

export interface CallResponse {
  success: boolean;
  callSid?: string;
  provider: VoiceProviderType;
  status: CallStatus;
  message: string;
  timestamp: number;
}

export interface VoiceCallProvider {
  initiateCall(targetPhone: string, eventId: string, reason: string): Promise<CallResponse>;
  getCallStatus(callSid: string): Promise<CallStatus>;
}
""",

    # 2. Provider Abstraction & Twilio / Mock Providers
    "functions/src/providers/voiceProvider.ts": """import { VoiceCallProvider, CallResponse, CallStatus } from '../types/voice';

export class MockVoiceProvider implements VoiceCallProvider {
  async initiateCall(targetPhone: string, eventId: string, reason: string): Promise<CallResponse> {
    const mockSid = `MOCK_CALL_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    return {
      success: true,
      callSid: mockSid,
      provider: 'MOCK',
      status: 'queued',
      message: `[TEST MODE] Mock emergency call dispatched to ${targetPhone} for event ${eventId}. Reason: ${reason}`,
      timestamp: Date.now(),
    };
  }

  async getCallStatus(callSid: string): Promise<CallStatus> {
    return 'completed';
  }
}

export class TwilioVoiceProvider implements VoiceCallProvider {
  private accountSid: string;
  private authToken: string;
  private fromPhone: string;

  constructor(accountSid: string, authToken: string, fromPhone: string) {
    if (!accountSid || !authToken || !fromPhone) {
      throw new Error('TWILIO_CONFIGURATION_ERROR: Missing required credentials on server.');
    }
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromPhone = fromPhone;
  }

  async initiateCall(targetPhone: string, eventId: string, reason: string): Promise<CallResponse> {
    // Dynamic import to prevent client bundling issues
    const twilio = require('twilio');
    const client = twilio(this.accountSid, this.authToken);

    const twimlUrl = `https://handler.twilio.com/twiml/EH${encodeURIComponent(eventId)}`;

    try {
      const call = await client.calls.create({
        url: 'http://demo.twilio.com/docs/voice.xml', // Replace with production TwiML URL
        to: targetPhone,
        from: this.fromPhone,
      });

      return {
        success: true,
        callSid: call.sid,
        provider: 'TWILIO',
        status: 'initiated',
        message: `Twilio call initiated successfully (SID: ${call.sid}).`,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'TWILIO',
        status: 'failed',
        message: `Twilio API Error: ${error.message || 'Call dispatch failed'}`,
        timestamp: Date.now(),
      };
    }
  }

  async getCallStatus(callSid: string): Promise<CallStatus> {
    const twilio = require('twilio');
    const client = twilio(this.accountSid, this.authToken);
    const call = await client.calls(callSid).fetch();
    return call.status as CallStatus;
  }
}

export function createVoiceProvider(): VoiceCallProvider {
  const isTestMode = process.env.ENABLE_REAL_CALLS !== 'true';
  if (isTestMode) {
    return new MockVoiceProvider();
  }

  return new TwilioVoiceProvider(
    process.env.TWILIO_ACCOUNT_SID || '',
    process.env.TWILIO_AUTH_TOKEN || '',
    process.env.TWILIO_PHONE_NUMBER || ''
  );
}
""",

    # 3. Server-side Validation Engine
    "functions/src/services/emergencyCallService.ts": """import { CallRequestPayload, CallResponse } from '../types/voice';
import { createVoiceProvider } from '../providers/voiceProvider';

// Server-side state store for cooldowns and deduplication
const processedRequests = new Set<string>();
const recentPhoneCooldowns = new Map<string, number>();
const COOLDOWN_MS = 300 * 1000; // 5 minute server-side hard enforce

export class EmergencyCallBackendService {
  public async processCallRequest(payload: CallRequestPayload): Promise<CallResponse> {
    // 1. Validate payload completeness
    if (!payload || !payload.requestId || !payload.eventId || !payload.targetPhone) {
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: 'REJECTED: Malformed call request payload.',
        timestamp: Date.now(),
      };
    }

    // 2. Strict Severity Validation
    if (payload.severity !== 'CRITICAL') {
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: `REJECTED: Non-CRITICAL severity level (${payload.severity}) cannot initiate voice calling.`,
        timestamp: Date.now(),
      };
    }

    // 3. E.164 Phone Format Validation
    const phoneRegex = /^\\+[1-9]\\d{1,14}$/;
    if (!phoneRegex.test(payload.targetPhone)) {
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: 'REJECTED: Phone number must strictly follow E.164 format (e.g. +15550199).',
        timestamp: Date.now(),
      };
    }

    // 4. Duplicate Request Id Protection
    if (processedRequests.has(payload.requestId)) {
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: `REJECTED: Duplicate call request ID (${payload.requestId}).`,
        timestamp: Date.now(),
      };
    }

    // 5. Server-side Cooldown Enforcement
    const lastCallTime = recentPhoneCooldowns.get(payload.targetPhone) || 0;
    const now = Date.now();
    if (now - lastCallTime < COOLDOWN_MS) {
      const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastCallTime)) / 1000);
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: `REJECTED: Target number in active server cooldown (${remainingSec}s remaining).`,
        timestamp: Date.now(),
      };
    }

    // Record request execution
    processedRequests.add(payload.requestId);
    recentPhoneCooldowns.set(payload.targetPhone, now);

    // 6. Execute Provider Call
    const provider = createVoiceProvider();
    return await provider.initiateCall(payload.targetPhone, payload.eventId, payload.reasonCode);
  }
}

export const emergencyCallBackendService = new EmergencyCallBackendService();
""",

    # 4. Firebase Cloud Function Entry Point
    "functions/src/index.ts": """import { onRequest } from 'firebase-functions/v2/https';
import { emergencyCallBackendService } from './services/emergencyCallService';
import { CallRequestPayload } from './types/voice';

export const initiateEmergencyCall = onRequest(
  { cors: true, secrets: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, message: 'Method Not Allowed' });
      return;
    }

    try {
      const payload: CallRequestPayload = req.body;
      const result = await emergencyCallBackendService.processCallRequest(payload);
      
      const statusCode = result.success ? 200 : 400;
      res.status(statusCode).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: `Server Error: ${err.message || 'Internal failure'}`,
        timestamp: Date.now(),
      });
    }
  }
);
""",

    # 5. Frontend Client Service (No Twilio Credentials embedded)
    "src/services/emergencyVoiceBackendClient.ts": """import { CallDecision } from '../types/triage';

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
""",

    # 6. Unit Tests Suite for Server Engine & Provider
    "src/tests/emergencyVoiceBackend.test.ts": """import { EmergencyCallBackendService } from '../../functions/src/services/emergencyCallService';
import { CallRequestPayload } from '../../functions/src/types/voice';

describe('PR25 — Secure Emergency Voice Backend Server Validation', () => {
  let backendService: EmergencyCallBackendService;

  beforeEach(() => {
    backendService = new EmergencyCallBackendService();
    process.env.ENABLE_REAL_CALLS = 'false'; // Enforce safe mock mode
  });

  test('Processes valid CRITICAL request in mock test mode', async () => {
    const payload: CallRequestPayload = {
      requestId: `req_valid_${Date.now()}`,
      eventId: 'evt_crit_01',
      targetPhone: '+15550199',
      severity: 'CRITICAL',
      reasonCode: 'ALL_SAFETY_CONDITIONS_PASSED',
      timestamp: Date.now(),
    };

    const response = await backendService.processCallRequest(payload);
    expect(response.success).toBe(true);
    expect(response.provider).toBe('MOCK');
    expect(response.callSid).toContain('MOCK_CALL_');
  });

  test('Rejects request if severity is not CRITICAL', async () => {
    const payload: any = {
      requestId: `req_mod_${Date.now()}`,
      eventId: 'evt_mod_01',
      targetPhone: '+15550199',
      severity: 'MODERATE',
      reasonCode: 'SEVERITY_NOT_CRITICAL',
      timestamp: Date.now(),
    };

    const response = await backendService.processCallRequest(payload);
    expect(response.success).toBe(false);
    expect(response.message).toContain('REJECTED: Non-CRITICAL severity level');
  });

  test('Rejects non-E.164 phone numbers', async () => {
    const payload: CallRequestPayload = {
      requestId: `req_bad_phone_${Date.now()}`,
      eventId: 'evt_crit_02',
      targetPhone: '555-0199', // Invalid format
      severity: 'CRITICAL',
      reasonCode: 'ALL_SAFETY_CONDITIONS_PASSED',
      timestamp: Date.now(),
    };

    const response = await backendService.processCallRequest(payload);
    expect(response.success).toBe(false);
    expect(response.message).toContain('E.164 format');
  });

  test('Blocks duplicate request IDs', async () => {
    const dupId = `req_dup_${Date.now()}`;
    const payload: CallRequestPayload = {
      requestId: dupId,
      eventId: 'evt_crit_03',
      targetPhone: '+15550188',
      severity: 'CRITICAL',
      reasonCode: 'ALL_SAFETY_CONDITIONS_PASSED',
      timestamp: Date.now(),
    };

    const firstResult = await backendService.processCallRequest(payload);
    expect(firstResult.success).toBe(true);

    const secondResult = await backendService.processCallRequest(payload);
    expect(secondResult.success).toBe(false);
    expect(secondResult.message).toContain('Duplicate call request ID');
  });
});
"""
}

def build_pr25():
    print("🚀 Starting PR25 Emergency Voice Backend File Generation...")
    for filepath, content in files_to_create.items():
        folder = os.path.dirname(filepath)
        if folder and not os.path.exists(folder):
            os.makedirs(folder, exist_ok=True)
            print(f"📁 Created directory: {folder}")
            
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Generated file: {filepath}")

    print("\n🎉 PR25 Backend Files Successfully Generated!")

if __name__ == "__main__":
    build_pr25()