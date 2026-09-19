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
  const apiKey = process.env.FAST2SMS_API_KEY;
  const recipient = toPhoneNumber || process.env.EMERGENCY_RECIPIENT_PHONE;

  // 1. Guard check for API key
  if (!apiKey) {
    return { success: false, error: 'Fast2SMS API Key missing in .env' };
  }

  // 2. Guard check to resolve 'undefined' error for recipient
  if (!recipient) {
    return { success: false, error: 'Recipient phone number is missing.' };
  }

  // Format phone number to 10 digits for Indian carriers
  const cleanPhone = recipient.replace(/\D/g, '').slice(-10);
  const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const messageBody = `🚨 NOEXCUSE EMERGENCY: HR: ${heartRate} bpm, SpO2: ${spO2}%. Reason: ${triggerReason}. Location: ${locationUrl}`;

  try {
    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'q',
        message: messageBody,
        language: 'english',
        flash: 0,
        numbers: cleanPhone,
      }),
    });

    const data = await response.json();

    if (data.return) {
      return {
        success: true,
        request_id: data.request_id,
        mode: 'FAST2SMS',
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to send SMS via Fast2SMS',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error calling Fast2SMS API',
    };
  }
};