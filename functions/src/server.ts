import dotenv from 'dotenv';
import path from 'path';

// 1. CRITICAL: Initialize environment configuration variables BEFORE importing local services
dotenv.config(); // Loads root level .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, './.env.local') });

// 2. Standard third-party library imports
import express, { Request, Response } from 'express';
import cors from 'cors';

// 3. Custom internal service imports (now safely loading config strings)
import { emergencyCallBackendService } from './services/emergencyCallService';
import { generateTwimlResponse } from './services/twimlGenerator';
import { sendEmergencySMS } from './services/smsService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req: Request, res: Response) => {
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
      error: error.message || 'Internal Server Error' 
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

// Emergency Alert SMS Endpoint (PR12 Telemetry Dispatch)
app.post('/api/alerts/sms', async (req: Request, res: Response): Promise<any> => {
  try {
    const { toPhoneNumber, heartRate, spO2, latitude, longitude, triggerReason } = req.body;

    // Strict validation for spatial coordinate anchoring
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Missing spatial coordinates (latitude/longitude required for location link).',
      });
    }

    // Call service with direct object payload values
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
      error: error.message || 'Internal Server Error executing SMS dispatch.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 NOEXCUSE HPO Express Backend running on port ${PORT}`);
});
