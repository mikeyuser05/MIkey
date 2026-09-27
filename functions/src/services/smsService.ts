import twilio from 'twilio';

export interface EmergencySMSParams {
  toPhoneNumber?: string;
  heartRate: number;
  spO2: number;
  latitude: number;
  longitude: number;
  triggerReason: string;
}

export const sendEmergencySMS = async ({
  toPhoneNumber,
  heartRate,
  spO2,
  latitude,
  longitude,
  triggerReason,
}: EmergencySMSParams) => {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  
  const recipient = toPhoneNumber || process.env.EMERGENCY_RECIPIENT_PHONE;

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhone) {
    return { success: false, error: 'Twilio configuration missing in .env' };
  }

  if (!recipient) {
    return { success: false, error: 'Recipient phone number missing.' };
  }

  const cleanPhone = recipient.replace(/\D/g, '').slice(-10);
  const e164Phone = `+91${cleanPhone}`;
  const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  
  // 1. Simple Urgent Speech Message for Twilio Voice Call
  const speechText = `<Response><Say voice="alice">Emergency Alert! Patient in emergency. Please check SMS for live location.</Say></Response>`;
  const twimlUrl = `http://twimlets.com/echo?Twiml=${encodeURIComponent(speechText)}`;

  // 2. Full Vitals & Maps Link for SMS Body
  const smsBody = `🚨 NOEXCUSE EMERGENCY: Patient in emergency! HR: ${heartRate} bpm, SpO2: ${spO2}%. Reason: ${triggerReason}. Location: ${locationUrl}`;

  try {
    // A. Dispatch Twilio Voice Call
    const twilioClient = twilio(twilioAccountSid, twilioAuthToken);
    const voicePromise = twilioClient.calls.create({
      url: twimlUrl,
      from: twilioPhone,
      to: e164Phone,
    });

    let smsPromise: Promise<Response> | null = null;

    // B. Dispatch Fast2SMS
    if (fast2SmsKey) {
      smsPromise = fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: smsBody,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });
    }

    const callRes = await voicePromise;
    let smsData = null;

    if (smsPromise) {
      const smsRes = await smsPromise;
      smsData = await smsRes.json();
    }

    return {
      success: true,
      mode: 'SIMPLE_EMERGENCY_VOICE_CALL',
      callSid: callRes.sid,
      smsResponse: smsData,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Alert dispatch failed.',
    };
  }
};