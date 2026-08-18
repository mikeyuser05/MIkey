export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null; // meters
  timestamp: number;
  source: 'gps' | 'network' | 'manual';
  valid: boolean;
}

export interface MapLinkOptions {
  latitude: number;
  longitude: number;
}

export class LocationValidator {
  public static isValidCoordinate(lat: number, lng: number): boolean {
    if (typeof lat !== 'number' || typeof lng !== 'number') return false;
    if (Number.isNaN(lat) || Number.isNaN(lng)) return false;
    // Reject 0,0 default invalid fix
    if (lat === 0 && lng === 0) return false;
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  public static isStale(timestamp: number, maxAgeMs: number = 120000): boolean {
    if (!timestamp) return true;
    return (Date.now() - timestamp) > maxAgeMs;
  }

  public static generateGoogleMapsUrl(lat: number, lng: number): string | null {
    if (!this.isValidCoordinate(lat, lng)) return null;
    return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  }
}
