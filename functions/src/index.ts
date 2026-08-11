import { onRequest } from 'firebase-functions/v2/https';
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
