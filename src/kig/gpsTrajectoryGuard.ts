/**
 * NOEXCUSE HPO V2
 * PR39.7 — GPS TRAJECTORY QUALITY GUARD
 *
 * Protects trajectory accumulation from implausible GPS samples.
 *
 * Validation pipeline:
 *
 * Raw GPS
 *    ↓
 * PR39.1 GPS Validator
 *    ↓
 * ValidatedGPSPoint
 *    ↓
 * PR39.7 Trajectory Quality Guard
 *    ↓
 * PR39.6 GPSTrajectory
 */

import {
  calculateGPSPointDistanceMeters,
} from "./gpsDistance";

import type {
  ValidatedGPSPoint,
} from "./types";


/**
 * Result of trajectory quality evaluation.
 */
export type GPSTrajectoryGuardStatus =
  | "GPS_TRAJECTORY_ACCEPTED"
  | "GPS_TRAJECTORY_TIMESTAMP_REGRESSION"
  | "GPS_TRAJECTORY_IMPOSSIBLE_JUMP";


/**
 * Configuration controlling trajectory plausibility checks.
 *
 * maxSpeedMetersPerSecond limits the maximum implied movement
 * speed between consecutive GPS points.
 */
export interface GPSTrajectoryGuardConfig {
  maxSpeedMetersPerSecond: number;
}


/**
 * Default trajectory plausibility configuration.
 *
 * This value is intentionally configurable rather than hardcoded
 * into the validation logic.
 */
export const DEFAULT_GPS_TRAJECTORY_GUARD_CONFIG:
  GPSTrajectoryGuardConfig = {
    maxSpeedMetersPerSecond: 100,
  };


/**
 * Detailed trajectory quality evaluation result.
 */
export interface GPSTrajectoryGuardResult {
  status: GPSTrajectoryGuardStatus;
  accepted: boolean;
  distanceMeters: number;
  elapsedMilliseconds: number | null;
  impliedSpeedMetersPerSecond: number | null;
}


/**
 * GPS trajectory quality guard.
 *
 * This class does not store trajectory history.
 *
 * It evaluates a candidate point against the previous accepted point.
 */
export class GPSTrajectoryGuard {
  private readonly config: GPSTrajectoryGuardConfig;


  public constructor(
    config: GPSTrajectoryGuardConfig =
      DEFAULT_GPS_TRAJECTORY_GUARD_CONFIG,
  ) {
    if (
      !Number.isFinite(
        config.maxSpeedMetersPerSecond,
      ) ||
      config.maxSpeedMetersPerSecond <= 0
    ) {
      throw new Error(
        "maxSpeedMetersPerSecond must be a positive finite number.",
      );
    }

    this.config = config;
  }


  /**
   * Evaluate whether a candidate point can safely be added after
   * the previous accepted point.
   *
   * The first trajectory point is always accepted.
   */
  public evaluate(
    previousPoint: ValidatedGPSPoint | null,
    candidatePoint: ValidatedGPSPoint,
  ): GPSTrajectoryGuardResult {
    if (!previousPoint) {
      return {
        status: "GPS_TRAJECTORY_ACCEPTED",
        accepted: true,
        distanceMeters: 0,
        elapsedMilliseconds: null,
        impliedSpeedMetersPerSecond: null,
      };
    }

    const elapsedMilliseconds =
      candidatePoint.timestamp -
      previousPoint.timestamp;

    if (elapsedMilliseconds <= 0) {
      return {
        status: "GPS_TRAJECTORY_TIMESTAMP_REGRESSION",
        accepted: false,
        distanceMeters: 0,
        elapsedMilliseconds,
        impliedSpeedMetersPerSecond: null,
      };
    }

    const distanceMeters =
      calculateGPSPointDistanceMeters(
        previousPoint,
        candidatePoint,
      );

    const elapsedSeconds =
      elapsedMilliseconds / 1000;

    const impliedSpeedMetersPerSecond =
      distanceMeters / elapsedSeconds;

    if (
      impliedSpeedMetersPerSecond >
      this.config.maxSpeedMetersPerSecond
    ) {
      return {
        status: "GPS_TRAJECTORY_IMPOSSIBLE_JUMP",
        accepted: false,
        distanceMeters,
        elapsedMilliseconds,
        impliedSpeedMetersPerSecond,
      };
    }

    return {
      status: "GPS_TRAJECTORY_ACCEPTED",
      accepted: true,
      distanceMeters,
      elapsedMilliseconds,
      impliedSpeedMetersPerSecond,
    };
  }
}
