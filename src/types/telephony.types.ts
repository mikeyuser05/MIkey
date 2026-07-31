export type CallStatus = 'QUEUED' | 'RINGING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface EmergencyCallPayload {
  recipientNumber: string;
  recipientName: string;
  nodeId: string;
  zone: string;
  vitalSummary: {
    heartRate: number;
    spO2: number;
    gasPPM: number;
  };
  customMessage?: string;
}

export interface EmergencyCallResponse {
  callId: string;
  status: CallStatus;
  dispatchedAt: string;
  estimatedDurationSeconds?: number;
}

export interface EmergencySMSPayload {
  recipientNumber: string;
  message: string;
  priority: 'HIGH' | 'CRITICAL';
}

export interface SMSResponse {
  messageId: string;
  delivered: boolean;
  sentAt: string;
}
