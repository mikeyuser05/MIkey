export interface SystemHealthStatus {
  telemetryStream: 'LIVE' | 'STALE' | 'OFFLINE';
  firebaseConnection: 'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED';
  alertEngineStatus: 'ACTIVE' | 'STANDBY';
  backendApiStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  twilioCallingReady: boolean;
  lastTelemetryTimestamp: number | null;
}

export class SystemHealthService {
  public static evaluateHealth(
    lastTelemetryTs: number | null,
    isFirebaseConnected: boolean,
    isBackendAlive: boolean
  ): SystemHealthStatus {
    const now = Date.now();
    let telemetryStreamStatus: 'LIVE' | 'STALE' | 'OFFLINE' = 'OFFLINE';

    if (lastTelemetryTs) {
      const ageSec = (now - lastTelemetryTs) / 1000;
      if (ageSec <= 15) telemetryStreamStatus = 'LIVE';
      else if (ageSec <= 60) telemetryStreamStatus = 'STALE';
      else telemetryStreamStatus = 'OFFLINE';
    }

    return {
      telemetryStream: telemetryStreamStatus,
      firebaseConnection: isFirebaseConnected ? 'CONNECTED' : 'DISCONNECTED',
      alertEngineStatus: 'ACTIVE',
      backendApiStatus: isBackendAlive ? 'ONLINE' : 'OFFLINE',
      twilioCallingReady: isBackendAlive,
      lastTelemetryTimestamp: lastTelemetryTs,
    };
  }
}
