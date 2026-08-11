import { CallRequestPayload, CallResponse } from '../types/voice';
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
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
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
