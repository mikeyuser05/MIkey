/**
 * NOEXCUSE HPO V2
 * PR39.4 — KIG V2B GPS STATE MANAGER
 *
 * Maintains the latest validated GPS state.
 *
 * Pipeline:
 *
 * RawGPSTelemetry
 *        ↓
 * validateGPS()
 *        ↓
 * KIGGPSState
 */

import {
  DEFAULT_GPS_VALIDATION_CONFIG,
} from "./types";

import type {
  GPSValidationConfig,
  KIGGPSState,
  RawGPSTelemetry,
} from "./types";

import {
  validateGPS,
} from "./gpsValidator";


/**
 * Creates the initial KIG GPS state.
 *
 * The application starts with no GPS fix.
 */
function createInitialGPSState(): KIGGPSState {
  return {
    status: "GPS_NO_FIX",
    currentLocation: null,
  };
}


/**
 * Stateful GPS manager.
 *
 * This class owns only the latest GPS state.
 *
 * Historical tracking belongs to a later PR39 trajectory layer.
 */
export class GPSStateManager {
  private readonly validationConfig: GPSValidationConfig;

  private state: KIGGPSState;


  public constructor(
    validationConfig: GPSValidationConfig =
      DEFAULT_GPS_VALIDATION_CONFIG,
  ) {
    this.validationConfig = validationConfig;
    this.state = createInitialGPSState();
  }


  /**
   * Process one incoming GPS sample.
   *
   * The returned state is also stored internally as the latest state.
   */
  public update(
    rawGPS: RawGPSTelemetry,
    now: number = Date.now(),
  ): KIGGPSState {
    const validation = validateGPS(
      rawGPS,
      this.validationConfig,
      now,
    );

    this.state = {
      status: validation.status,
      currentLocation: validation.point,
    };

    return this.getState();
  }


  /**
   * Returns the latest immutable state snapshot.
   */
  public getState(): KIGGPSState {
    return {
      status: this.state.status,
      currentLocation: this.state.currentLocation
        ? {
            ...this.state.currentLocation,
          }
        : null,
    };
  }


  /**
   * Reset the GPS manager to its initial state.
   */
  public reset(): KIGGPSState {
    this.state = createInitialGPSState();

    return this.getState();
  }
}
