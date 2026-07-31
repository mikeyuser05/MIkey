export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface EmergencyActionPayload {
  nodeId: string;
  action: 'PING_BUZZER' | 'REMOTE_MUTE' | 'DISPATCH' | 'TRIGGER_VOICE_ALERT';
  zone: string;
  reason?: string;
  operatorId?: string;
}

export interface EmergencyActionResponse {
  actionId: string;
  status: 'QUEUED' | 'EXECUTED' | 'FAILED';
  dispatchedAt: string;
}

export interface BackendHealthResponse {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  version: string;
  uptimeSeconds: number;
  services: {
    database: boolean;
    telephonyGateway: boolean;
    auditLogger: boolean;
  };
}
