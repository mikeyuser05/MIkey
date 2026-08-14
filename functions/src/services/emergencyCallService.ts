import twilio from 'twilio';

// 🔥 Memory map to track last call time per phone number (Top-level scope)
const lastCallMap = new Map<string, number>();
const COOLDOWN_PERIOD_MS = 30 * 1000; // 30 Seconds cooldown

export class EmergencyCallBackendService {
  private twilioClient: any;
  private fromNumber: string;
  private isEnabled: boolean;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.isEnabled = process.env.ENABLE_REAL_CALLS === 'true';

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  public async processCallRequest(payload: any) {
    // Extract recipient phone number flexible way se
    const targetPhone = 
      payload.to || 
      payload.phone || 
      payload.recipientPhone || 
      (payload.contacts && payload.contacts[0]?.phone) ||
      (payload.contacts && payload.contacts[0]?.phoneNumber);

    if (!targetPhone) {
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: 'REJECTED: Missing phone number in payload.',
        timestamp: Date.now()
      };
    }

    // 🔥 Rate Limit & Cooldown Check
    const now = Date.now();
    if (lastCallMap.has(targetPhone)) {
      const lastTime = lastCallMap.get(targetPhone)!;
      if (now - lastTime < COOLDOWN_PERIOD_MS) {
        const remainingSec = Math.ceil((COOLDOWN_PERIOD_MS - (now - lastTime)) / 1000);
        return {
          success: false,
          provider: 'TWILIO',
          status: 'throttled',
          message: `Rate limit exceeded: A call was recently placed to this number. Try again in ${remainingSec}s.`,
          timestamp: now
        };
      }
    }

    if (!this.isEnabled || !this.twilioClient) {
      return {
        success: false,
        provider: 'MOCK',
        status: 'failed',
        message: 'Real calls disabled or Twilio credentials missing.',
        timestamp: Date.now()
      };
    }

    try {
      // 🔥 Update last call timestamp right before making the real external API call
      lastCallMap.set(targetPhone, now);

      const webhookUrl = 'https://noexcuse-hpo-backend.onrender.com/api/twilio/webhook';
      
      const call = await this.twilioClient.calls.create({
        url: webhookUrl,
        to: targetPhone,
        from: this.fromNumber
      });

      return {
        success: true,
        provider: 'TWILIO',
        status: 'queued',
        callSid: call.sid,
        timestamp: Date.now()
      };
    } catch (error: any) {
      // If the API call fails, remove from lock so user can try again immediately
      lastCallMap.delete(targetPhone);

      return {
        success: false,
        provider: 'TWILIO',
        status: 'failed',
        message: error.message || 'Twilio call dispatch failed',
        timestamp: Date.now()
      };
    }
  }
}

export const emergencyCallBackendService = new EmergencyCallBackendService();
