/**
 * NOEXCUSE HPO V2 - Simulated Voice Alert Dispatcher
 * Constructs synthesized emergency calls for verification without live telephony calls.
 */

import { AlertEvaluationResult, EmergencyContact } from '../types/pr11Triage';

export interface VoiceCallDispatch {
  id: string;
  recipientName: string;
  phoneNumber: string;
  messageText: string;
  dispatchedAt: number;
  isSimulated: true;
}

export class SimulatedVoiceDispatcher {
  // 🔥 Cooldown state variables added
  private lastCallTimestamp: number = 0;
  private readonly CALL_COOLDOWN_MS: number = 30000; // 30 seconds cooldown

  /**
   * Generates a simulated voice call message payload and dispatches a backend call request if cooldown passed.
   */
  public generateSimulatedCall(
    evaluation: AlertEvaluationResult,
    contact: EmergencyContact,
    locationFresh: boolean = false,
    locationString: string = 'Unknown / Not Reported',
    currentTimeMs: number = Date.now()
  ): VoiceCallDispatch {
    const durationSec = Math.round(evaluation.durationMs / 1000);
    const locationPrefix = locationFresh ? 'Current location is' : 'Last known location is';
    
    const messageText = `SIMULATED EMERGENCY CALL: Emergency alert for node ${evaluation.nodeId}. ` +
      `Condition detected: ${evaluation.reason}. ` +
      `The condition has persisted continuously for ${durationSec} seconds. ` +
      `${locationPrefix} ${locationString}. Immediate assistance required.`;

    const dispatch: VoiceCallDispatch = {
      id: `SIM_DISPATCH_${currentTimeMs}_${Math.random().toString(36).substring(2, 6)}`,
      recipientName: contact.name,
      phoneNumber: contact.phone,
      messageText,
      dispatchedAt: currentTimeMs,
      isSimulated: true
    };

    console.log('----------------------------------------------------');
    console.log('🚨 [SIMULATED EMERGENCY VOICE DISPATCH EXECUTED]');
    console.log(`Target Contact : ${dispatch.recipientName} (${dispatch.phoneNumber})`);
    console.log(`Voice Payload  : "${dispatch.messageText}"`);
    console.log('----------------------------------------------------');

    // 🔥 Check if 30 seconds have passed since the last call
    const now = Date.now();
    if (now - this.lastCallTimestamp < this.CALL_COOLDOWN_MS) {
      const remainingSec = Math.ceil((this.CALL_COOLDOWN_MS - (now - this.lastCallTimestamp)) / 1000);
      console.log(`⏳ [CALL COOLDOWN ACTIVE] Call skipped. Next call allowed in ${remainingSec}s.`);
      return dispatch; // Skips fetch and just returns the dispatch payload safely
    }

    // Cooldown passed, update timestamp for next check
    this.lastCallTimestamp = now;

    // Direct fetch call to backend API
    fetch('https://noexcuse-hpo-backend.onrender.com/api/emergency-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        to: contact.phone || '+916350375677',
        reason: evaluation.reason || 'Critical Emergency Alert',
        eventId: dispatch.id
      })
    })
    .then(res => res.json())
    .then(data => console.log('🚀 Backend Trigger Success:', data))
    .catch(err => console.error('❌ Backend Trigger Failed:', err));

    return dispatch;
  }
}

export const simulatedVoiceDispatcher = new SimulatedVoiceDispatcher();
