import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { emergencyCallBackendService } from './services/emergencyCallService';
import { generateTwimlResponse } from './services/twimlGenerator';

dotenv.config();

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

app.listen(PORT, () => {
  console.log(`🚀 NOEXCUSE HPO Express Backend running on port ${PORT}`);
});