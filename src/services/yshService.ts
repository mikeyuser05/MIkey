import { ref, onValue, set } from 'firebase/database';
import { firebaseDb as db } from '../config/firebase.config';
import { YSHConfig } from '../types/location';

const YSH_LOCATION_PATH = 'system/ysh/location';

export const validateCoordinates = (lat: number, lng: number, alt: number): boolean => {
  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof alt !== 'number') return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(alt)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
};

export const subscribeYSHConfig = (callback: (config: YSHConfig | null) => void) => {
  const yshRef = ref(db, YSH_LOCATION_PATH);
  return onValue(yshRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as YSHConfig);
    } else {
      callback(null);
    }
  });
};

export const updateYSHConfig = async (config: Omit<YSHConfig, 'updatedAt' | 'source'>) => {
  if (!validateCoordinates(config.latitude, config.longitude, config.altitude)) {
    throw new Error('Invalid coordinates or altitude value provided for YSH.');
  }

  const payload: YSHConfig = {
    ...config,
    source: 'ysh',
    updatedAt: Date.now(),
  };

  const yshRef = ref(db, YSH_LOCATION_PATH);
  await set(yshRef, payload);
};
