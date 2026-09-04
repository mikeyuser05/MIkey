import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { firebaseDb as db } from '../config/firebase.config';

export interface GPSData {
  latitude: number;
  longitude: number;
  altitude: number;
  satellites: number;
  valid: boolean;
}

export const useGPSTelemetry = () => {
  const [gpsData, setGpsData] = useState<GPSData>({
    latitude: 0,
    longitude: 0,
    altitude: 0,
    satellites: 0,
    valid: false,
  });

  useEffect(() => {
    if (!db) return;

    // Listen to YSH Fallback first
    const yshRef = ref(db, 'system/ysh/location');
    const unsubYSH = onValue(yshRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        if (val.enabled) {
          setGpsData({
            latitude: Number(val.latitude) || 0,
            longitude: Number(val.longitude) || 0,
            altitude: Number(val.altitude) || 0,
            satellites: Number(val.satellites) || 0,
            valid: true,
          });
          return;
        }
      }

      // Fallback to Hardware Stream if YSH is disabled
      const hwRef = ref(db, 'NOEXCUSE_HPO/GPS');
      onValue(hwRef, (hwSnap) => {
        if (hwSnap.exists()) {
          const hwVal = hwSnap.val();
          setGpsData({
            latitude: Number(hwVal.Latitude || hwVal.latitude) || 0,
            longitude: Number(hwVal.Longitude || hwVal.longitude) || 0,
            altitude: Number(hwVal.Altitude || hwVal.altitude) || 0,
            satellites: Number(hwVal.Satellites || hwVal.satellites) || 0,
            valid: Boolean(hwVal.Valid ?? hwVal.valid),
          });
        }
      }, { onlyOnce: true });
    });

    return () => unsubYSH();
  }, []);

  return gpsData;
};