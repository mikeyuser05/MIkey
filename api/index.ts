import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';

// Import your services (using the relative path to functions/src/services)
import { emergencyCallBackendService } from '../functions/src/services/emergencyCallService';
import { generateTwimlResponse } from '../functions/src/services/twimlGenerator';
import { sendEmergencySMS } from '../functions/src/services/smsService';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api', (req: Request, res: Response) => {
  res.json({ status: 'OK', service: 'NOEXCUSE HPO Emergency Call API' });
});

// Main Call Dispatch Endpoint
app.post('/api/emergency-call', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const result = await emergencyCallBackendService.processCallRequest(payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error',
    });
  }
});

// Twilio Voice Webhook Endpoint
app.post('/api/twilio/webhook', (req: Request, res: Response) => {
  try {
    const twiml = generateTwimlResponse(req.body);
    res.type('text/xml').send(twiml);
  } catch (error: any) {
    res.status(500).send('<Response><Say>An error occurred executing webhook.</Say></Response>');
  }
});

// Emergency Alert SMS Endpoint
app.post('/api/alerts/sms', async (req: Request, res: Response): Promise<any> => {
  try {
    const { toPhoneNumber, heartRate, spO2, latitude, longitude, triggerReason } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing spatial coordinates (latitude/longitude required for location link).',
      });
    }

    const result = await sendEmergencySMS({
      toPhoneNumber: toPhoneNumber || process.env.EMERGENCY_RECIPIENT_PHONE,
      heartRate,
      spO2,
      latitude,
      longitude,
      triggerReason,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error executing SMS dispatch.',
    });
  }
});

// Export Express app instance for Vercel Serverless Function engine
export default app;