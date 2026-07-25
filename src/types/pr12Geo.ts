/**
 * NOEXCUSE HPO V2 - PR12 Location & Geofencing Types
 */

export interface GPSTelemetry {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracyMeters: number;
  satellites: number;
  hasFix: boolean;
  timestamp: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
  isRestricted: boolean;
}

export interface GeoDispatchPayload {
  formattedCoordinates: string;
  googleMapsUrl: string;
  zoneName: string;
  isRestrictedArea: boolean;
  accuracyWarning: boolean;
}
