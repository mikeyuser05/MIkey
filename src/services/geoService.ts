/**
 * NOEXCUSE HPO V2 - Location & Geofencing Engine (PR12)
 * Validates GPS fixes, maps coordinates to known zones, and formats dispatch URLs.
 */

import { GPSTelemetry, GeofenceZone, GeoDispatchPayload } from '../types/pr12Geo';

// Pre-defined operational site geofences
const SITE_ZONES: GeofenceZone[] = [
  { id: 'ZONE_01', name: 'Sector 4 — Processing Lab', minLat: 26.4480, maxLat: 26.4520, minLng: 74.6300, maxLng: 74.6350, isRestricted: false },
  { id: 'ZONE_02', name: 'Sector 2 — High Voltage Substation', minLat: 26.4521, maxLat: 26.4560, minLng: 74.6351, maxLng: 74.6400, isRestricted: true },
  { id: 'ZONE_03', name: 'Sector 1 — Outdoor Perimeter', minLat: 26.4400, maxLat: 26.4479, minLng: 74.6200, maxLng: 74.6299, isRestricted: false }
];

export class GeoService {
  public validateFix(gps: GPSTelemetry, currentTime: number = Date.now()): { isValid: boolean; reason?: string } {
    if (!gps.hasFix) {
      return { isValid: false, reason: 'GPS fix lost / No Satellite Lock' };
    }
    if (gps.satellites < 4) {
      return { isValid: false, reason: 'Low satellite count (<4 satellites)' };
    }
    if (gps.accuracyMeters > 50) {
      return { isValid: false, reason: 'Poor accuracy radius (>50 meters)' };
    }
    if (currentTime - gps.timestamp > 30000) {
      return { isValid: false, reason: 'Stale GPS telemetry (>30s old)' };
    }
    return { isValid: true };
  }

  public resolveZone(lat: number, lng: number): GeofenceZone | null {
    for (const zone of SITE_ZONES) {
      if (lat >= zone.minLat && lat <= zone.maxLat && lng >= zone.minLng && lng <= zone.maxLng) {
        return zone;
      }
    }
    return null;
  }

  public generateGeoDispatchPayload(gps: GPSTelemetry, currentTime: number = Date.now()): GeoDispatchPayload {
    const fixValidation = this.validateFix(gps, currentTime);
    const zone = this.resolveZone(gps.latitude, gps.longitude);

    const formattedCoordinates = `${gps.latitude.toFixed(6)}, ${gps.longitude.toFixed(6)}`;
    const googleMapsUrl = `https://maps.google.com/?q=${gps.latitude.toFixed(6)},${gps.longitude.toFixed(6)}`;

    return {
      formattedCoordinates,
      googleMapsUrl,
      zoneName: zone ? zone.name : 'Unknown Outdoor Field / Unmapped Zone',
      isRestrictedArea: zone ? zone.isRestricted : false,
      accuracyWarning: !fixValidation.isValid
    };
  }
}

export const geoService = new GeoService();
