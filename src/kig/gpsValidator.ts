import {
  DEFAULT_GPS_VALIDATION_CONFIG,
  GPSValidationConfig,
  GPSValidationResult,
  RawGPSTelemetry,
} from "./types";


/**
 * Returns true only for finite numeric values.
 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}


/**
 * Validates geographic latitude.
 */
export function isValidLatitude(latitude: unknown): latitude is number {
  return (
    isFiniteNumber(latitude) &&
    latitude >= -90 &&
    latitude <= 90
  );
}


/**
 * Validates geographic longitude.
 */
export function isValidLongitude(longitude: unknown): longitude is number {
  return (
    isFiniteNumber(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}


/**
 * Validates GPS speed.
 *
 * Speed is optional because some GPS samples may not provide it.
 * When present, it must be finite and non-negative.
 */
export function isValidSpeed(speed: unknown): speed is number | null {
  if (speed === null) {
    return true;
  }

  return isFiniteNumber(speed) && speed >= 0;
}


/**
 * Validates a Unix timestamp in milliseconds.
 */
export function isValidTimestamp(timestamp: unknown): timestamp is number {
  return (
    isFiniteNumber(timestamp) &&
    timestamp > 0
  );
}


/**
 * Determines whether a timestamp is stale.
 */
export function isStaleTimestamp(
  timestamp: number,
  now: number,
  staleAfterMs: number,
): boolean {
  return now - timestamp > staleAfterMs;
}


/**
 * Validate raw GPS telemetry.
 *
 * Validation order:
 *
 * 1. GPS fix availability
 * 2. Coordinate validity
 * 3. Speed validity
 * 4. Timestamp validity
 * 5. Timestamp freshness
 */
export function validateGPS(
  raw: RawGPSTelemetry,
  config: GPSValidationConfig = DEFAULT_GPS_VALIDATION_CONFIG,
  now: number = Date.now(),
): GPSValidationResult {
  if (!raw.hasFix) {
    return {
      status: "GPS_NO_FIX",
      point: null,
    };
  }

  if (
    !isValidLatitude(raw.latitude) ||
    !isValidLongitude(raw.longitude)
  ) {
    return {
      status: "GPS_INVALID",
      point: null,
    };
  }

  if (!isValidSpeed(raw.speed)) {
    return {
      status: "GPS_INVALID",
      point: null,
    };
  }

  if (!isValidTimestamp(raw.timestamp)) {
    return {
      status: "GPS_INVALID",
      point: null,
    };
  }

  if (
    isStaleTimestamp(
      raw.timestamp,
      now,
      config.staleAfterMs,
    )
  ) {
    return {
      status: "GPS_STALE",
      point: null,
    };
  }

  return {
    status: "GPS_VALID",
    point: {
      latitude: raw.latitude,
      longitude: raw.longitude,
      speed: raw.speed,
      timestamp: raw.timestamp,
      status: "GPS_VALID",
    },
  };
}
