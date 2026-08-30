/**
 * NOEXCUSE HPO V2
 * KIG V2B public module boundary.
 */

export { KIGEngine } from "./kigEngine";

export {
  isStaleTimestamp,
  isValidLatitude,
  isValidLongitude,
  isValidSpeed,
  isValidTimestamp,
  validateGPS,
} from "./gpsValidator";

export {
  DEFAULT_GPS_VALIDATION_CONFIG,
} from "./types";

export type {
  GPSStatus,
  GPSValidationConfig,
  GPSValidationResult,
  KIGGPSState,
  RawGPSTelemetry,
  ValidatedGPSPoint,
} from "./types";
