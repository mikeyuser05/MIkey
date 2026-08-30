import {
  GPSValidationConfig,
  KIGGPSState,
  RawGPSTelemetry,
} from "./types";

import { validateGPS } from "./gpsValidator";


/**
 * KIG V2B GPS foundation engine.
 *
 * Current responsibility:
 * - Accept raw GPS telemetry.
 * - Validate GPS data.
 * - Produce a clean KIG GPS state.
 *
 * Future PR39 phases may extend this engine with:
 * - distance
 * - activity
 * - trajectory
 *
 * Those features are intentionally NOT implemented here.
 */
export class KIGEngine {
  private readonly validationConfig: GPSValidationConfig;

  public constructor(validationConfig: GPSValidationConfig) {
    this.validationConfig = validationConfig;
  }


  /**
   * Process one raw GPS sample.
   */
  public processGPS(
    rawGPS: RawGPSTelemetry,
    now: number = Date.now(),
  ): KIGGPSState {
    const validation = validateGPS(
      rawGPS,
      this.validationConfig,
      now,
    );

    return {
      status: validation.status,
      currentLocation: validation.point,
    };
  }
}
