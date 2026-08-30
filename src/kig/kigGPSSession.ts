/**
 * NOEXCUSE HPO V2
 * PR39.9 — KIG GPS SESSION ENGINE
 *
 * Unified GPS processing boundary.
 *
 * Pipeline:
 *
 * RawGPSTelemetry
 *       ↓
 * GPSStateManager
 *       ↓
 * Validated current location
 *       ↓
 * GuardedGPSTrajectory
 *       ↓
 * KIG GPS Session State
 *
 * Invalid/no-fix telemetry never enters the trajectory.
 * Implausible trajectory points never affect accumulated distance.
 */

import {
  GPSStateManager,
} from "./gpsStateManager";

import {
  GuardedGPSTrajectory,
} from "./guardedGPSTrajectory";

import type {
  KIGGPSState,
  RawGPSTelemetry,
  ValidatedGPSPoint,
} from "./types";

import type {
  GPSTrajectoryState,
} from "./gpsTrajectory";

import type {
  GPSTrajectoryGuardConfig,
  GPSTrajectoryGuardResult,
} from "./gpsTrajectoryGuard";


/**
 * Complete state of one KIG GPS processing session.
 */
export interface KIGGPSSessionState {
  gps: KIGGPSState;
  trajectory: GPSTrajectoryState;
  lastTrajectoryGuard: GPSTrajectoryGuardResult | null;
}


/**
 * Unified GPS processing session.
 *
 * This class coordinates existing PR39 modules without replacing
 * their individual responsibilities.
 */
export class KIGGPSSession {
  private readonly gpsStateManager: GPSStateManager;

  private readonly trajectory: GuardedGPSTrajectory;

  private lastTrajectoryGuard: GPSTrajectoryGuardResult | null = null;


  public constructor(
    trajectoryGuardConfig?: GPSTrajectoryGuardConfig,
  ) {
    this.gpsStateManager = new GPSStateManager();

    this.trajectory = new GuardedGPSTrajectory(
      trajectoryGuardConfig,
    );
  }


  /**
   * Process one incoming raw GPS telemetry sample.
   *
   * GPS validation remains delegated to GPSStateManager.
   *
   * Only a validated current location is considered for
   * trajectory accumulation.
   */
  public update(
    rawGPS: RawGPSTelemetry,
    now: number = Date.now(),
  ): KIGGPSSessionState {
    const gpsState =
      this.gpsStateManager.update(
        rawGPS,
        now,
      );

    const point =
      gpsState.currentLocation;

    if (point) {
      const trajectoryResult =
        this.trajectory.addPoint(
          point as ValidatedGPSPoint,
        );

      this.lastTrajectoryGuard =
        trajectoryResult.guard;
    } else {
      this.lastTrajectoryGuard = null;
    }

    return this.getState();
  }


  /**
   * Return the complete immutable session snapshot.
   */
  public getState(): KIGGPSSessionState {
    return {
      gps: {
        status: this.gpsStateManager
          .getState()
          .status,

        currentLocation: this.clonePoint(
          this.gpsStateManager
            .getState()
            .currentLocation,
        ),
      },

      trajectory:
        this.trajectory.getState(),

      lastTrajectoryGuard:
        this.lastTrajectoryGuard
          ? {
              ...this.lastTrajectoryGuard,
            }
          : null,
    };
  }


  /**
   * Reset the complete GPS session.
   */
  public reset(): KIGGPSSessionState {
    this.gpsStateManager.reset();
    this.trajectory.reset();
    this.lastTrajectoryGuard = null;

    return this.getState();
  }


  private clonePoint(
    point: ValidatedGPSPoint | null,
  ): ValidatedGPSPoint | null {
    return point
      ? {
          ...point,
        }
      : null;
  }
}
