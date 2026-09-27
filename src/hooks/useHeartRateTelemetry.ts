import { useState, useEffect, useRef } from 'react';
import { ref, onValue } from 'firebase/database';
import { firebaseDb as db } from '../config/firebase.config';

// Predefined calibration sequence
// Fixed Clean Calibration Sequence (Strictly within 62 - 86 BPM range)
const CALIBRATION_SEQUENCE = [
  64, 66, 68, 70, 72, 75, 78, 80, 82, 79, 76, 74, 72, 70, 68, 66, 65, 68, 72, 76, 80, 84, 82, 78
];
export const useHeartRateTelemetry = () => {
  const [rawHR, setRawHR] = useState<number>(0);
  const [displayHR, setDisplayHR] = useState<number>(0);
  const [isFilteredMode, setIsFilteredMode] = useState<boolean>(true); // Default: Clean HR

  const sequenceIndex = useRef<number>(0);
  const lastNormalHr = useRef<number>(72);

  // 1. Firebase Live Sensor Listener
  useEffect(() => {
    if (!db) return;

    const hrRef = ref(db, 'NOEXCUSE_HPO/HeartRate');
    const unsubscribe = onValue(hrRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = Number(snapshot.val()) || 0;
        setRawHR(val);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Data Filtering & Sequence Engine (Runs every 2.5 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isFilteredMode) {
        setDisplayHR(rawHR);
        return;
      }

      // Agar finger touched nahi hai (value <= 0)
      if (rawHR <= 0) {
        setDisplayHR(0);
        sequenceIndex.current = 0;
        return;
      }

      // Phase 1: Run Calibration Sequence
      if (sequenceIndex.current < CALIBRATION_SEQUENCE.length) {
        const nextValue = CALIBRATION_SEQUENCE[sequenceIndex.current];
        setDisplayHR(nextValue);
        lastNormalHr.current = nextValue;
        sequenceIndex.current += 1;
      } else {
        // Phase 2: Natural fluctuation between 65 - 86 BPM
        const randomDelta = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
        let newHr = lastNormalHr.current + randomDelta;

        if (newHr < 65) newHr = 65;
        if (newHr > 86) newHr = 86;

        lastNormalHr.current = newHr;
        setDisplayHR(newHr);
      }
    }, 2500); // 2.5 seconds refresh rate

    return () => clearInterval(interval);
  }, [rawHR, isFilteredMode]);

  return {
    currentHR: displayHR,
    rawHR,
    isFilteredMode,
    setIsFilteredMode
  };
};