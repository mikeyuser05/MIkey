import {
  ref,
  onValue,
  off,
  type DatabaseReference,
  type Unsubscribe,
} from 'firebase/database';

import { realtimeDb } from './firebaseConfig';

export interface DeviceTelemetry {
  deviceId: string;
  heartRate: number;
  spo2: number;
  gas: number;
  steps: number;
  lastPacket: number;
  status: 'online' | 'offline' | 'warning';
  fingerDetected: boolean;
}

export interface TelemetryPayload {
  heartRate: number;
  spo2: number;
  gas: number;
  steps: number;
  alarm: boolean;
  link: boolean;
  lastPacket: number;
  timestamp: number;
  fingerDetected: boolean;
  devices: Record<string, DeviceTelemetry>;
}

export type TelemetryCallback = (payload: TelemetryPayload) => void;

class TelemetryService {
  private readonly rootPath = 'NOEXCUSE_HPO';

  subscribe(callback: TelemetryCallback): Unsubscribe {
    const telemetryRef: DatabaseReference = ref(realtimeDb, this.rootPath);

    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const rawHR = Number(data.HeartRate ?? 0);
      const rawSpO2 = Number(data.SpO2 ?? 0);
      const rawGas = Number(data.Gas ?? 0);
      const rawSteps = Number(data.Steps ?? 0);

      // Check if finger is actually on the sensor
      const hasFinger = rawHR > 0 && rawSpO2 > 0;

      // Construct Multi-Node Telemetry Map for PR1 to PR10
      const devicesMap: Record<string, DeviceTelemetry> = {
        PR1: { deviceId: 'PR1', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
        PR2: { deviceId: 'PR2', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
        PR5: { deviceId: 'PR5', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
        PR6: { deviceId: 'PR6', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
        PR7: { deviceId: 'PR7', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
        PR8: { deviceId: 'PR8', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
        PR9: { deviceId: 'PR9', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
        PR10: { deviceId: 'PR10', heartRate: rawHR, spo2: rawSpO2, gas: rawGas, steps: rawSteps, lastPacket: Date.now(), status: 'online', fingerDetected: hasFinger },
      };

      const payload: TelemetryPayload = {
        heartRate: rawHR,
        spo2: rawSpO2,
        gas: rawGas,
        steps: rawSteps,
        alarm: Boolean(data.Alarm),
        link: Boolean(data.Link),
        lastPacket: Number(data.LastPacket ?? Date.now()),
        timestamp: Date.now(),
        fingerDetected: hasFinger,
        devices: devicesMap
      };

      callback(payload);
    });

    return () => {
      off(telemetryRef);
      unsubscribe();
    };
  }
}

export const telemetryService = new TelemetryService();