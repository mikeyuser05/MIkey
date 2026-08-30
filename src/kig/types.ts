/**
 * NOEXCUSE HPO V2
 * PR39.1 — KIG V2B GPS DATA CONTRACT
 *
 * This module defines the boundary between:
 *
 * Raw GPS telemetry
 *        ↓
 * Validated GPS telemetry
 *        ↓
 * KIG V2B processed GPS state
 *
 * No hardware, Firebase, React, or UI dependencies are allowed here.
 */


/**
 * GPS validity state.
 *
 * GPS_NO_FIX:
 *   Hardware reports that a valid satellite fix is unavailable.
 *
 * GPS_VALID:
 *   GPS data passed structural validation.
 *
 * GPS_INVALID:
 *   GPS data exists but contains invalid or malformed values.
 *
 * GPS_STALE:
 *   GPS data is older than the configured freshness threshold.
 */
export type GPSStatus =
  | "GPS_NO_FIX"
  | "GPS_VALID"
  | "GPS_INVALID"
  | "GPS_STALE";


/**
 * Raw GPS telemetry entering the HPO application boundary.
 *
 * This contract represents data received from the existing telemetry pipeline.
 *
 * Coordinates are nullable because a GPS device with no fix must not fabricate
 * coordinates such as 0,0.
 */
export interface RawGPSTelemetry {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  timestamp: number | null;
  hasFix: boolean;
}


/**
 * A GPS point that has passed validation.
 */
export interface ValidatedGPSPoint {
  latitude: number;
  longitude: number;
  speed: number | null;
  timestamp: number;
  status: "GPS_VALID";
}


/**
 * Result returned by GPS validation.
 */
export interface GPSValidationResult {
  status: GPSStatus;
  point: ValidatedGPSPoint | null;
}


/**
 * Minimal KIG V2B GPS state.
 *
 * PR39.1 deliberately does not include:
 * - distance calculations
 * - activity classification
 * - trajectory history
 * - map rendering
 *
 * Those belong to later PR39 phases.
 */
export interface KIGGPSState {
  status: GPSStatus;
  currentLocation: ValidatedGPSPoint | null;
}


/**
 * GPS validation configuration.
 *
 * staleAfterMs defines how long a GPS sample may remain valid.
 */
export interface GPSValidationConfig {
  staleAfterMs: number;
}


/**
 * Default validation configuration.
 *
 * Kept centralized so future project-level configuration can replace
 * this value without scattering thresholds across the codebase.
 */
export const DEFAULT_GPS_VALIDATION_CONFIG: GPSValidationConfig = {
  staleAfterMs: 30_000,
};
