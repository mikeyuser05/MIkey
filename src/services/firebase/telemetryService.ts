import {
  ref,
  onValue,
  off,
  type DatabaseReference,
  type Unsubscribe,
} from 'firebase/database';

import { realtimeDb } from './firebaseConfig';

export interface TelemetryPayload {
  heartRate: number;
  spo2: number;
  gas: number;
  steps: number;
  alarm: boolean;
  link: boolean;
  lastPacket: number;
  timestamp: number;
}

export type TelemetryCallback = (payload: TelemetryPayload) => void;

class TelemetryService {
  private readonly rootPath = 'NOEXCUSE_HPO';

  subscribe(callback: TelemetryCallback): Unsubscribe {
    const telemetryRef: DatabaseReference = ref(realtimeDb, this.rootPath);

    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const data = snapshot.val();
      
      console.log("RTDB Snapshot raw data:", data);

      if (!data) return;

      // 1. Create the payload object first
      const payload: TelemetryPayload = {
        heartRate: Number(data.HeartRate ?? 0),
        spo2: Number(data.SpO2 ?? 0),
        gas: Number(data.Gas ?? 0),
        steps: Number(data.Steps ?? 0),
        alarm: Boolean(data.Alarm),
        link: Boolean(data.Link),
        lastPacket: Number(data.LastPacket ?? 0),
        timestamp: Date.now(),
      };

      // 2. 👇 Log the payload here
      console.log("Telemetry Payload", payload);

      // 3. Pass the payload to the callback function
      callback(payload);
    });

    return () => {
      off(telemetryRef);
      unsubscribe();
    };
  }
}

export const telemetryService = new TelemetryService();
