import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { firebaseDb as db } from '../config/firebase.config';
import { filterHeartRate } from '../utils/hrFilter';

export const useHeartRateTelemetry = () => {
  const [rawHR, setRawHR] = useState<number>(0);
  const [displayHR, setDisplayHR] = useState<number>(0);
  const [isFilteredMode, setIsFilteredMode] = useState<boolean>(true); // Default: Clean HR

  useEffect(() => {
    if (!db) return;

    const hrRef = ref(db, 'NOEXCUSE_HPO/HeartRate');
    const unsubscribe = onValue(hrRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = Number(snapshot.val()) || 0;
        setRawHR(val);

        if (isFilteredMode) {
          setDisplayHR(filterHeartRate(val));
        } else {
          setDisplayHR(val);
        }
      }
    });

    return () => unsubscribe();
  }, [isFilteredMode]);

  return {
    currentHR: displayHR,
    rawHR,
    isFilteredMode,
    setIsFilteredMode
  };
};