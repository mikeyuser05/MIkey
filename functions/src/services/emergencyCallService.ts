import twilio from 'twilio';

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