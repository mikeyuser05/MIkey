/**
 * NOEXCUSE HPO V2
 * PR39.6 — GPS TRAJECTORY ACCUMULATION FOUNDATION
 *
 * Maintains an ordered history of validated GPS points.
 *
 * Pipeline:
 *
 * ValidatedGPSPoint
 *        ↓
 * GPS Trajectory
 *        ├── ordered points
 *        ├── latest segment distance
 *        └── total distance
 *
 * Geographic distance calculation is delegated to the existing
 * PR39.5 GPS distance engine.
 */

import {
  calculateGPSPointDistanceMeters,
} from "./gpsDistance";

import type {
  ValidatedGPSPoint,
} from "./types";


/**
 * Immutable trajectory snapshot.
 */
export interface GPSTrajectoryState {
  /**
   * Ordered validated GPS points.
   */
  points: ValidatedGPSPoint[];

  /**
   * Distance between the two most recent trajectory points.
   *
   * Zero when fewer than two points exist.
   */
  latestSegmentDistanceMeters: number;

  /**
   * Total accumulated distance across all trajectory segments.
   */
  totalDistanceMeters: number;
}


/**
 * Create an empty trajectory state.
 */
function createInitialTrajectoryState(): GPSTrajectoryState {
  return {
    points: [],
    latestSegmentDistanceMeters: 0,
    totalDistanceMeters: 0,
  };
}


/**
 * GPS trajectory accumulator.
 *
 * Only validated GPS points should enter this class.
 *
 * Validation responsibility remains upstream:
 *
 * Raw GPS
 *    ↓
 * GPS Validator
 *    ↓
 * ValidatedGPSPoint
 *    ↓
 * GPSTrajectory
 */
export class GPSTrajectory {
  private points: ValidatedGPSPoint[] = [];

  private latestSegmentDistanceMeters = 0;

  private totalDistanceMeters = 0;


  /**
   * Add one validated GPS point to the trajectory.
   *
   * The first point establishes the trajectory origin and contributes
   * zero distance.
   *
   * Each subsequent point creates one geographic segment from the
   * previous point.
   */
  public addPoint(
    point: ValidatedGPSPoint,
  ): GPSTrajectoryState {
    const previousPoint =
      this.points.length > 0
        ? this.points[this.points.length - 1]
        : null;

    if (previousPoint) {
      const segmentDistance =
        calculateGPSPointDistanceMeters(
          previousPoint,
          point,
        );

      this.latestSegmentDistanceMeters =
        segmentDistance;

      this.totalDistanceMeters +=
        segmentDistance;
    } else {
      this.latestSegmentDistanceMeters = 0;
    }

    this.points.push({
      ...point,
    });

    return this.getState();
  }


  /**
   * Return the current immutable trajectory snapshot.
   */
  public getState(): GPSTrajectoryState {
    return {
      points: this.points.map(
        (point) => ({
          ...point,
        }),
      ),

      latestSegmentDistanceMeters:
        this.latestSegmentDistanceMeters,

      totalDistanceMeters:
        this.totalDistanceMeters,
    };
  }


  /**
   * Return the most recently accepted trajectory point.
   */
  public getLatestPoint(): ValidatedGPSPoint | null {
    const latestPoint =
      this.points.length > 0
        ? this.points[this.points.length - 1]
        : null;

    return latestPoint
      ? { ...latestPoint }
      : null;
  }


  /**
   * Return the number of accepted trajectory points.
   */
  public getPointCount(): number {
    return this.points.length;
  }


  /**
   * Reset the trajectory and accumulated distance.
   */
  public reset(): GPSTrajectoryState {
    this.points = [];
    this.latestSegmentDistanceMeters = 0;
    this.totalDistanceMeters = 0;

    return this.getState();
  }
}
