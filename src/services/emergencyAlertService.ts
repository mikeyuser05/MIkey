import { getActiveYSHLocation } from './yshService';

// Dynamic API Base URL for both Localhost & Vercel
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return ''; // Relative path for Vercel deployment (/api/...)
  }
  return 'http://localhost:3001'; // Local Express server
};

// Internal Helper to make Single Voice Call
async function triggerBackendVoiceCall(toPhoneNumber?: string) {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/emergency-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: toPhoneNumber || '+916350375677',
      }),
    });
    return await response.json();
  } catch (err: any) {
    console.error('Voice call trigger failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Single Alert (For Red Button) — Sends 1x SMS + 1x Call ONLY (No 20s Retry)
 */
export async function triggerSinglePR44EmergencyAlert(
  heartRate: number,
  spO2: number,
  triggerReason: string = 'Manual Emergency Triggered',
  toPhoneNumber?: string
) {
  let smsSuccess = false;
  let lastError: string | undefined = undefined;
  let location = { latitude: 26.4499, longitude: 74.6399 };

  try {
    const loc = await getActiveYSHLocation();
    if (loc) location = loc;
  } catch (e) {
    console.warn('Location fetch fallback used');
  }

  const baseUrl = getApiBaseUrl();

  // 1. Send 1x SMS
  try {
    const response = await fetch(`${baseUrl}/api/alerts/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toPhoneNumber,
        heartRate,
        spO2,
        latitude: location.latitude,
        longitude: location.longitude,
        triggerReason,
      }),
    });
    smsSuccess = response.ok;
  } catch (err: any) {
    console.error('SMS Alert Failed:', err.message);
    lastError = err.message;
  }

  // 2. Dispatch 1x Voice Call (Instantly at 0s)
  console.log('🚨 Dispatching Single Manual Call...');
  const callRes = await triggerBackendVoiceCall(toPhoneNumber);
  if (!callRes.success && !lastError) {
    lastError = callRes.error;
  }

  return { success: true, smsDispatched: smsSuccess, error: lastError };
}

/**
 * Scenario Simulator Pipeline — Sends 1x SMS + Call #1 (0s) AND Call #2 (20s Gap)
 */
export async function triggerPR44EmergencyAlert(
  heartRate: number,
  spO2: number,
  triggerReason: string = 'Critical Vitals Threshold Exceeded',
  toPhoneNumber?: string
) {
  let smsSuccess = false;
  let lastError: string | undefined = undefined;
  let location = { latitude: 26.4499, longitude: 74.6399 };

  try {
    const loc = await getActiveYSHLocation();
    if (loc) location = loc;
  } catch (e) {
    console.warn('Location fetch fallback used');
  }

  const baseUrl = getApiBaseUrl();

  // 1. Send 1x SMS
  try {
    const response = await fetch(`${baseUrl}/api/alerts/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toPhoneNumber,
        heartRate,
        spO2,
        latitude: location.latitude,
        longitude: location.longitude,
        triggerReason,
      }),
    });
    smsSuccess = response.ok;
  } catch (err: any) {
    console.error('SMS Alert Failed:', err.message);
    lastError = err.message;
  }

  // 2. Dispatch Call #1 (0th Second)
  console.log('🚨 Dispatching Call #1 (0s)...');
  triggerBackendVoiceCall(toPhoneNumber);

  // 3. Dispatch Call #2 (20th Second Gap)
  setTimeout(() => {
    console.log('📞 20s Elapsed: Dispatching Call #2...');
    triggerBackendVoiceCall(toPhoneNumber);
  }, 20000);

  return { success: true, smsDispatched: smsSuccess, error: lastError };
}

export default triggerPR44EmergencyAlert;