import { onRequest } from 'firebase-functions/v2/https';
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
