export type LocationSource = 'gps' | 'ysh' | 'none';
export type RuntimeMode = 'live' | 'test';

export interface YSHConfig {
  enabled: boolean;
  latitude: number;
  longitude: number;
  altitude: number;
  satellites?: number;
  label: string;
  updatedAt: number;
  source: 'ysh';
}

export interface RawGPSTelemetry {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  satellites: number;
  isFixValid: boolean;
  timestamp?: number;
}

export interface ResolvedLocation {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  satellites: number;
  source: LocationSource;
  label?: string;
  isFixValid: boolean;
}
