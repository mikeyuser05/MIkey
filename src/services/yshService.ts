import { ref, onValue, set } from 'firebase/database';
import { firebaseDb as db } from '../config/firebase.config';
import { YSHConfig } from '../types/location';

export const subscribeYSHConfig = (callback: (config: YSHConfig) => void) => {
  if (!db) return () => {};

  const yshRef = ref(db, 'system/ysh/location');
  const unsubscribe = onValue(yshRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });

  return unsubscribe;
};

export const updateYSHConfig = async (config: YSHConfig): Promise<void> => {
  if (!db) return;

  const timestamp = Date.now();

  // 1. Save state to YSH config path
  const yshRef = ref(db, 'system/ysh/location');
  await set(yshRef, {
    ...config,
    updatedAt: timestamp
  });

  // 2. Sync values directly into the hardware telemetry node used by the GPS page
  if (config.enabled) {
    const hardwareGpsRef = ref(db, 'NOEXCUSE_HPO/GPS');
    await set(hardwareGpsRef, {
      Altitude: config.altitude,
      Latitude: config.latitude,
      Longitude: config.longitude,
      Satellites: config.satellites,
      Valid: true
    });
  }
};
export const getActiveYSHLocation = async () => {
  // Fetch current config or return defaults
  return new Promise<{ latitude: number; longitude: number }>((resolve) => {
    const unsubscribe = subscribeYSHConfig((config) => {
      if (config && config.enabled) {
        resolve({ latitude: config.latitude, longitude: config.longitude });
      } else {
        // Fallback default coordinates
        resolve({ latitude: 26.912400, longitude: 75.787300 });
      }
      unsubscribe();
    });
  });
};