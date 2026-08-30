/**
 * NOEXCUSE HPO V2
 * PR39.5 — KIG V2B GPS DISTANCE ENGINE
 *
 * Geographic distance calculation using the Haversine formula.
 *
 * Input:
 *   Two validated GPS coordinates.
 *
 * Output:
 *   Distance in meters.
 *
 * This module is intentionally pure and stateless.
 */


const EARTH_RADIUS_METERS = 6_371_000;


/**
 * Convert degrees to radians.
 */
function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}


/**
 * Calculate the geographic distance between two coordinates.
 *
 * Uses the Haversine formula.
 *
 * @returns Distance in meters.
 */
export function calculateGPSDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const latitudeARadians = degreesToRadians(latitudeA);
  const latitudeBRadians = degreesToRadians(latitudeB);

  const deltaLatitude = degreesToRadians(
    latitudeB - latitudeA,
  );

  const deltaLongitude = degreesToRadians(
    longitudeB - longitudeA,
  );

  const haversine =
    Math.sin(deltaLatitude / 2) *
      Math.sin(deltaLatitude / 2) +
    Math.cos(latitudeARadians) *
      Math.cos(latitudeBRadians) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(haversine),
      Math.sqrt(1 - haversine),
    );

  return EARTH_RADIUS_METERS * angularDistance;
}


/**
 * Calculate distance directly from point objects.
 */
export function calculateGPSPointDistanceMeters(
  pointA: {
    latitude: number;
    longitude: number;
  },
  pointB: {
    latitude: number;
    longitude: number;
  },
): number {
  return calculateGPSDistanceMeters(
    pointA.latitude,
    pointA.longitude,
    pointB.latitude,
    pointB.longitude,
  );
}
