export type VoiceProviderType = 'TWILIO' | 'MOCK';

export type NormalizedCallStatus = 
  | 'queued' 
  | 'ringing' 
  | 'in-progress' 
  | 'completed' 
  | 'busy' 
  | 'failed' 
  | 'no-answer';

export interface TelemetryDetails {
  nodeId?: string;
  heartRate?: number;
  spo2?: number;
  gasLevelPpm?: number;
  timestamp?: number;
}

export interface CallRequestPayload {
  requestId: string;
  eventId: string;
  targetPhone: string;
  severity: 'CRITICAL';
  reasonCode: string;
  telemetryDetails?: TelemetryDetails;
  timestamp: number;
}

export interface CallResponse {
  success: boolean;
  callSid?: string;
  provider: VoiceProviderType;
  status: NormalizedCallStatus;
  message: string;
  timestamp: number;
}

export interface VoiceCallProvider {
  initiateCall(
    targetPhone: string, 
    eventId: string, 
    reason: string, 
    telemetry?: TelemetryDetails,
    callbackUrl?: string
  ): Promise<CallResponse>;
  getCallStatus(callSid: string): Promise<NormalizedCallStatus>;
}
