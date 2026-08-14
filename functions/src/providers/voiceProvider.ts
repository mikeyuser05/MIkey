import { VoiceCallProvider, CallResponse, NormalizedCallStatus, TelemetryDetails } from '../types/voice';
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
