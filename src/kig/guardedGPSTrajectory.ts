/**
 * NOEXCUSE HPO V2
 * PR39.8 — GUARDED GPS TRAJECTORY MANAGER
 *
 * Pipeline:
 *
 * ValidatedGPSPoint
 *        ↓
 * GPSTrajectoryGuard
 *        ↓
 * accepted ───────────────→ GPSTrajectory
 *
 * rejected ───────────────→ rejection result
 *
 * Rejected points never contribute to trajectory distance.
 */

import {
  GPSTrajectory,
} from "./gpsTrajectory";

import {
  DEFAULT_GPS_TRAJECTORY_GUARD_CONFIG,
  GPSTrajectoryGuard,
} from "./gpsTrajectoryGuard";

import type {
  GPSTrajectoryState,
} from "./gpsTrajectory";

import type {
  GPSTrajectoryGuardConfig,
  GPSTrajectoryGuardResult,
} from "./gpsTrajectoryGuard";

import type {
  ValidatedGPSPoint,
} from "./types";


/**
 * Complete result produced when processing one GPS point.
 */
export interface GuardedTrajectoryUpdateResult {
  guard: GPSTrajectoryGuardResult;
  trajectory: GPSTrajectoryState;
}


/**
 * Combined guarded trajectory manager.
 *
 * This is the production boundary between:
 *
 * Validated GPS input
 *        ↓
 * Trajectory plausibility validation
 *        ↓
 * Safe trajectory accumulation
 */
export class GuardedGPSTrajectory {
  private readonly trajectory: GPSTrajectory;

  private readonly guard: GPSTrajectoryGuard;


  public constructor(
    guardConfig: GPSTrajectoryGuardConfig =
      DEFAULT_GPS_TRAJECTORY_GUARD_CONFIG,
  ) {
    this.trajectory = new GPSTrajectory();

    this.guard = new GPSTrajectoryGuard(
      guardConfig,
    );
  }


  /**
   * Process one validated GPS point.
   *
   * Points failing trajectory plausibility checks are rejected
   * and are never added to the accumulated trajectory.
   */
  public addPoint(
    point: ValidatedGPSPoint,
  ): GuardedTrajectoryUpdateResult {
    const previousPoint =
      this.trajectory.getLatestPoint();

    const guardResult =
      this.guard.evaluate(
        previousPoint,
        point,
      );

    if (guardResult.accepted) {
      this.trajectory.addPoint(point);
    }

    return {
      guard: guardResult,
      trajectory: this.trajectory.getState(),
    };
  }


  /**
   * Return the current safe trajectory snapshot.
   */
  public getState(): GPSTrajectoryState {
    return this.trajectory.getState();
  }


  /**
   * Return the number of accepted trajectory points.
   */
  public getPointCount(): number {
    return this.trajectory.getPointCount();
  }


  /**
   * Reset the complete guarded trajectory state.
   */
  public reset(): GPSTrajectoryState {
    return this.trajectory.reset();
  }
}
