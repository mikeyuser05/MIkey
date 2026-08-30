/**
 * NOEXCUSE HPO V2
 * PR39.3 — GPS TELEMETRY ADAPTER
 *
 * Boundary:
 *
 * Existing HPO telemetry pipeline
 *          ↓
 * GPS hardware transport payload
 *          ↓
 * Raw KIG GPS telemetry
 *
 * This adapter contains no:
 * - Firebase access
 * - ESP-NOW logic
 * - React logic
 * - hardware logic
 *
 * It exists so KIG V2B remains independent from the exact transport layer.
 */

import type {
  GPSHardwarePayload,
} from "./gpsTransportContract";

import type {
  RawGPSTelemetry,
} from "./types";


/**
 * Converts GPS transport data into the raw telemetry contract
 * consumed by the KIG V2B validation layer.
 *
 * No geographic validation occurs here.
 *
 * Geographic validation belongs to gpsValidator.ts.
 */
export function adaptGPSPayload(
  payload: GPSHardwarePayload,
): RawGPSTelemetry {
  return {
    latitude: payload.latitude,
    longitude: payload.longitude,
    speed: payload.speed,
    timestamp: payload.timestamp,
    hasFix: payload.hasFix,
  };
}


/**
 * Returns an explicit no-fix GPS payload.
 *
 * Coordinates remain null.
 *
 * This prevents missing GPS data from becoming fabricated coordinates.
 */
export function createNoFixGPSPayload(
  timestamp: number | null = null,
): RawGPSTelemetry {
  return {
    latitude: null,
    longitude: null,
    speed: null,
    timestamp,
    hasFix: false,
  };
}
