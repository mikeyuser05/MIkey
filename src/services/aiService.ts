// PR41.1 & PR41.2: Extended Types & Firebase Mapper Logic

export interface VitalMetric {
  value?: number;
  status?: string;
  unit?: string;
}

export interface FirebaseGPSPayload {
  Altitude?: number;
  Latitude?: number;
  Longitude?: number;
  Satellites?: number;
  Valid?: boolean;
}

export interface FirebaseTelemetryPayload {
  Alarm?: boolean;
  Gas?: number;
  HeartRate?: number;
  LastPacket?: number;
  Link?: boolean;
  SpO2?: number;
  Steps?: number;
  GPS?: FirebaseGPSPayload;
}

export interface GPSStatus {
  fix: boolean;
  valid: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  satellites: number;
}

export interface StructuredHealthContext {
  vitalMetrics: {
    heartRate: VitalMetric;
    spO2: VitalMetric;
    gasPpm: number;
    steps?: number;
  };
  gpsStatus: GPSStatus;
  alarm?: boolean;
  link?: boolean;
  lastPacket?: number;
  timestamp: number;
}

/**
 * PR41.2: Normalizes raw Firebase RTDB payload to StructuredHealthContext
 */
export function mapFirebaseToHealthContext(payload: FirebaseTelemetryPayload): StructuredHealthContext {
  const rawGps = payload.GPS || {};
  const isValid = Boolean(rawGps.Valid);

  return {
    vitalMetrics: {
      heartRate: { value: payload.HeartRate ?? 0, status: payload.HeartRate ? 'NOMINAL' : 'STALE', unit: 'BPM' },
      spO2: { value: payload.SpO2 ?? 0, status: payload.SpO2 ? 'NOMINAL' : 'STALE', unit: '%' },
      gasPpm: payload.Gas ?? 0,
      steps: payload.Steps ?? 0,
    },
    gpsStatus: {
      fix: isValid,
      valid: isValid,
      latitude: rawGps.Latitude ?? 0,
      longitude: rawGps.Longitude ?? 0,
      altitude: rawGps.Altitude ?? 0,
      satellites: rawGps.Satellites ?? 0,
    },
    alarm: payload.Alarm ?? false,
    link: Boolean(payload.Link),
    lastPacket: payload.LastPacket ?? 0,
    timestamp: Date.now(),
  };
}
