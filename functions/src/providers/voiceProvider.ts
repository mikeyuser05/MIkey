import { VoiceCallProvider, CallResponse, CallStatus } from '../types/voice';

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
