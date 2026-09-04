// src/utils/hrFilter.ts

const RECENT_BUFFER_SIZE = 5;
let hrBuffer: number[] = [];

/**
 * Filters noisy MAX30100 PPG sensor data.
 * Rejects physiologically impossible spikes and applies a rolling window average.
 */
export const filterHeartRate = (rawHR: number): number => {
  // 1. Ignore zero/invalid baseline readings
  if (rawHR <= 0) return 0;

  // 2. Reject extreme non-human noise spikes
  if (rawHR < 40 || rawHR > 200) {
    return hrBuffer.length > 0 ? hrBuffer[hrBuffer.length - 1] : 72;
  }

  // 3. Outlier suppression based on last valid reading
  if (hrBuffer.length > 0) {
    const lastValid = hrBuffer[hrBuffer.length - 1];
    const delta = Math.abs(rawHR - lastValid);
    
    // If spike is greater than 30 BPM in a single reading, dampen it
    if (delta > 30) {
      const smoothedVal = Math.round(lastValid + (rawHR > lastValid ? 5 : -5));
      hrBuffer.push(smoothedVal);
    } else {
      hrBuffer.push(rawHR);
    }
  } else {
    hrBuffer.push(rawHR);
  }

  // Keep buffer size fixed
  if (hrBuffer.length > RECENT_BUFFER_SIZE) {
    hrBuffer.shift();
  }

  // Return moving average
  const sum = hrBuffer.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / hrBuffer.length);
};

export const resetHRFilter = () => {
  hrBuffer = [];
};