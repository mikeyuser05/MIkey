export type VoiceProviderType = 'TWILIO' | 'MOCK';

export type CallStatus = 'queued' | 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed';

export interface CallRequestPayload {
  requestId: string;
  eventId: string;
  targetPhone: string;
  severity: 'CRITICAL';
  reasonCode: string;
  authToken?: string;
  timestamp: number;
}

export interface CallResponse {
  success: boolean;
  callSid?: string;
  provider: VoiceProviderType;
  status: CallStatus;
  message: string;
  timestamp: number;
}

export interface VoiceCallProvider {
  initiateCall(targetPhone: string, eventId: string, reason: string): Promise<CallResponse>;
  getCallStatus(callSid: string): Promise<CallStatus>;
}
