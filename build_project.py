import os

files_to_create = {
    # 1. Server Types Extension
    "functions/src/types/voice.ts": """export type VoiceProviderType = 'TWILIO' | 'MOCK';

export type NormalizedCallStatus = 
  | 'queued' 
  | 'ringing' 
  | 'in-progress' 
  | 'completed' 
  | 'busy' 
  | 'failed' 
  | 'no-answer';

export interface TelemetryDetails {
  nodeId?: string;
  heartRate?: number;
  spo2?: number;
  gasLevelPpm?: number;
  timestamp?: number;
}

export interface CallRequestPayload {
  requestId: string;
  eventId: string;
  targetPhone: string;
  severity: 'CRITICAL';
  reasonCode: string;
  telemetryDetails?: TelemetryDetails;
  timestamp: number;
}

export interface CallResponse {
  success: boolean;
  callSid?: string;
  provider: VoiceProviderType;
  status: NormalizedCallStatus;
  message: string;
  timestamp: number;
}

export interface VoiceCallProvider {
  initiateCall(
    targetPhone: string, 
    eventId: string, 
    reason: string, 
    telemetry?: TelemetryDetails,
    callbackUrl?: string
  ): Promise<CallResponse>;
  getCallStatus(callSid: string): Promise<NormalizedCallStatus>;
}
""",

    # 2. Dynamic TwiML Speech Generator
    "functions/src/services/twimlGenerator.ts": """import { TelemetryDetails } from '../types/voice';

export class TwiMLGenerator {
  public static generateEmergencySpeech(
    eventId: string, 
    reason: string, 
    telemetry?: TelemetryDetails
  ): string {
    const node = telemetry?.nodeId || 'UNKNOWN_NODE';
    const hr = telemetry?.heartRate ? `${telemetry.heartRate} beats per minute` : 'Unavailable';
    const spo2 = telemetry?.spo2 ? `${telemetry.spo2} percent` : 'Unavailable';
    const gas = telemetry?.gasLevelPpm ? `${telemetry.gasLevelPpm} parts per million` : 'Normal';

    const speechMessage = `
<Response>
  <Say voice="Polly.Amy-Neural" language="en-US">
    This is an automated critical health alert from HPO V2 Health Monitoring System.
    A validated critical health event has been detected on device node ${node}.
    Current vital parameters:
    Heart Rate: ${hr}.
    Oxygen Saturation: ${spo2}.
    Toxic Gas Level: ${gas}.
    Event Reason: ${reason}.
    Please check the monitored individual and dispatch emergency response immediately.
  </Say>
  <Pause length="2"/>
  <Say voice="Polly.Amy-Neural" language="en-US">
    Repeating emergency alert. Monitored node ${node} requires immediate assistance.
  </Say>
</Response>
    `.trim();

    return speechMessage;
  }
}
""",

    # 3. Call Status Normalizer
    "functions/src/services/callStatusNormalizer.ts": """import { NormalizedCallStatus } from '../types/voice';

export class CallStatusNormalizer {
  public static normalizeTwilioStatus(rawStatus: string): NormalizedCallStatus {
    const statusMap: Record<string, NormalizedCallStatus> = {
      'queued': 'queued',
      'initiated': 'queued',
      'ringing': 'ringing',
      'in-progress': 'in-progress',
      'completed': 'completed',
      'busy': 'busy',
      'failed': 'failed',
      'no-answer': 'no-answer',
      'canceled': 'failed',
    };

    const normalized = statusMap[rawStatus.toLowerCase()];
    return normalized || 'failed';
  }
}
""",

    # 4. Twilio Provider with Live Speech & Webhooks
    "functions/src/providers/voiceProvider.ts": """import { VoiceCallProvider, CallResponse, NormalizedCallStatus, TelemetryDetails } from '../types/voice';
import { TwiMLGenerator } from '../services/twimlGenerator';
import { CallStatusNormalizer } from '../services/callStatusNormalizer';

export class MockVoiceProvider implements VoiceCallProvider {
  async initiateCall(
    targetPhone: string, 
    eventId: string, 
    reason: string,
    telemetry?: TelemetryDetails
  ): Promise<CallResponse> {
    const mockSid = `MOCK_CALL_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    return {
      success: true,
      callSid: mockSid,
      provider: 'MOCK',
      status: 'queued',
      message: `[SAFE MOCK MODE] Automated emergency speech generated for target ${targetPhone}. Node: ${telemetry?.nodeId || 'N/A'}. No actual call placed.`,
      timestamp: Date.now(),
    };
  }

  async getCallStatus(callSid: string): Promise<NormalizedCallStatus> {
    return 'completed';
  }
}

export class TwilioVoiceProvider implements VoiceCallProvider {
  private accountSid: string;
  private authToken: string;
  private fromPhone: string;

  constructor(accountSid: string, authToken: string, fromPhone: string) {
    if (!accountSid || !authToken || !fromPhone) {
      throw new Error('TWILIO_CONFIG_ERROR: Server missing Twilio account parameters.');
    }
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.fromPhone = fromPhone;
  }

  async initiateCall(
    targetPhone: string, 
    eventId: string, 
    reason: string,
    telemetry?: TelemetryDetails,
    callbackUrl?: string
  ): Promise<CallResponse> {
    const twilio = require('twilio');
    const client = twilio(this.accountSid, this.authToken);

    const twimlXml = TwiMLGenerator.generateEmergencySpeech(eventId, reason, telemetry);

    try {
      const callOptions: any = {
        twiml: twimlXml,
        to: targetPhone,
        from: this.fromPhone,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      };

      if (callbackUrl) {
        callOptions.statusCallback = callbackUrl;
        callOptions.statusCallbackMethod = 'POST';
      }

      const call = await client.calls.create(callOptions);
      const initialStatus = CallStatusNormalizer.normalizeTwilioStatus(call.status);

      return {
        success: true,
        callSid: call.sid,
        provider: 'TWILIO',
        status: initialStatus,
        message: `Real Twilio emergency call initiated successfully (SID: ${call.sid}).`,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        provider: 'TWILIO',
        status: 'failed',
        message: `Twilio API Execution Error: ${error.message || 'Call failed'}`,
        timestamp: Date.now(),
      };
    }
  }

  async getCallStatus(callSid: string): Promise<NormalizedCallStatus> {
    const twilio = require('twilio');
    const client = twilio(this.accountSid, this.authToken);
    const call = await client.calls(callSid).fetch();
    return CallStatusNormalizer.normalizeTwilioStatus(call.status);
  }
}

export function createVoiceProvider(): VoiceCallProvider {
  const isProductionCallsEnabled = process.env.ENABLE_REAL_CALLS === 'true';
  if (!isProductionCallsEnabled) {
    return new MockVoiceProvider();
  }

  return new TwilioVoiceProvider(
    process.env.TWILIO_ACCOUNT_SID || '',
    process.env.TWILIO_AUTH_TOKEN || '',
    process.env.TWILIO_PHONE_NUMBER || ''
  );
}
""",

    # 5. Twilio Status Webhook Function
    "functions/src/webhooks/twilioWebhook.ts": """import { onRequest } from 'firebase-functions/v2/https';
import { CallStatusNormalizer } from '../services/callStatusNormalizer';

export const twilioCallWebhook = onRequest(
  { cors: true },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const callSid = req.body.CallSid;
      const rawStatus = req.body.CallStatus;
      const normalizedStatus = CallStatusNormalizer.normalizeTwilioStatus(rawStatus);

      console.log(`[PR26 WEBHOOK] CallSid: ${callSid} | Raw Status: ${rawStatus} | Normalized: ${normalizedStatus}`);

      // Respond back to Twilio with 200 OK
      res.status(200).send(`<Response></Response>`);
    } catch (error: any) {
      console.error('[PR26 WEBHOOK ERROR]', error);
      res.status(500).send('Webhook processing error');
    }
  }
);
""",

    # 6. Function Root Exports
    "functions/src/index.ts": """import { onRequest } from 'firebase-functions/v2/https';
import { emergencyCallBackendService } from './services/emergencyCallService';
import { CallRequestPayload } from './types/voice';
import { twilioCallWebhook } from './webhooks/twilioWebhook';

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

export { twilioCallWebhook };
""",

    # 7. Unit Tests for PR26
    "src/tests/pr26VoiceCall.test.ts": """import { TwiMLGenerator } from '../../functions/src/services/twimlGenerator';
import { CallStatusNormalizer } from '../../functions/src/services/callStatusNormalizer';

describe('PR26 — Automated Voice Message & Status Normalization Tests', () => {
  test('Generates TwiML voice XML with telemetry details', () => {
    const twiml = TwiMLGenerator.generateEmergencySpeech(
      'evt_crit_101',
      'CRITICAL_GAS_EXPOSURE',
      {
        nodeId: 'NODE_ESP32_01',
        heartRate: 135,
        spo2: 88,
        gasLevelPpm: 1200,
      }
    );

    expect(twiml).toContain('<Response>');
    expect(twiml).toContain('NODE_ESP32_01');
    expect(twiml).toContain('135 beats per minute');
    expect(twiml).toContain('88 percent');
    expect(twiml).toContain('1200 parts per million');
    expect(twiml).toContain('CRITICAL_GAS_EXPOSURE');
  });

  test('Normalizes Twilio call statuses accurately', () => {
    expect(CallStatusNormalizer.normalizeTwilioStatus('initiated')).toBe('queued');
    expect(CallStatusNormalizer.normalizeTwilioStatus('ringing')).toBe('ringing');
    expect(CallStatusNormalizer.normalizeTwilioStatus('in-progress')).toBe('in-progress');
    expect(CallStatusNormalizer.normalizeTwilioStatus('completed')).toBe('completed');
    expect(CallStatusNormalizer.normalizeTwilioStatus('busy')).toBe('busy');
    expect(CallStatusNormalizer.normalizeTwilioStatus('no-answer')).toBe('no-answer');
    expect(CallStatusNormalizer.normalizeTwilioStatus('canceled')).toBe('failed');
  });
});
"""
}

def build_pr26():
    print("🚀 Starting PR26 Real Automated Emergency Voice Call Generation...")
    for filepath, content in files_to_create.items():
        folder = os.path.dirname(filepath)
        if folder and not os.path.exists(folder):
            os.makedirs(folder, exist_ok=True)
            print(f"📁 Created directory: {folder}")
            
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"✅ Generated file: {filepath}")

    print("\n🎉 PR26 Files Successfully Built!")

if __name__ == "__main__":
    build_pr26()