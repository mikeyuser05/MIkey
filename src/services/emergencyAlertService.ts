/**
 * Emergency Alert Service — PR44 Telemetry Dispatch
 */

import { getActiveYSHLocation } from './yshService';

export async function triggerPR44EmergencyAlert(
  heartRate: number,
  spO2: number,
  triggerReason: string = 'Critical Vitals Threshold Exceeded',
  toPhoneNumber?: string
) {
  try {
    // Fetch live active coordinates dynamically from YSH service
    const location = await getActiveYSHLocation();

    // Route directly to your local backend server on port 3001
    const response = await fetch('http://localhost:3001/api/alerts/sms', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        toPhoneNumber,
        heartRate,
        spO2,
        latitude: location?.latitude ?? 26.4499, // Fallback safety coordinates
        longitude: location?.longitude ?? 74.6399,
        triggerReason,
      }),
    });

    // Safely parse response text to prevent sudden JSON crash exceptions
    const responseText = await response.text();
    const data = responseText ? JSON.parse(responseText) : {};

    if (!response.ok) {
      throw new Error(data.error || `Server error (Status ${response.status})`);
    }

    return data;
  } catch (err: any) {
    console.error('Failed to trigger SMS alert:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

export default triggerPR44EmergencyAlert;
