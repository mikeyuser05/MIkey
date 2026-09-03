import { describe, it, expect } from 'vitest';
import { resolveLocation } from '@/utils/locationResolver';
import { YSHConfig, RawGPSTelemetry } from '@/types/location';

describe('PR43.4 Location Resolver & Fallback Suite', () => {
  const validGPS: RawGPSTelemetry = {
    latitude: 28.6139,
    longitude: 77.209,
    altitude: 216,
    satellites: 8,
    isFixValid: true,
  };

  const validYSH: YSHConfig = {
    enabled: true,
    latitude: 26.9124,
    longitude: 75.7873,
    altitude: 431,
    satellites: 0,
    label: 'YSH Base',
    updatedAt: Date.now(),
    source: 'ysh',
  };

  it('prioritizes GPS when GPS fix is valid and device is online in live mode', () => {
    const result = resolveLocation({
      runtimeMode: 'live',
      isDeviceOnline: true,
      gpsTelemetry: validGPS,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('gps');
    expect(result.latitude).toBe(28.6139);
    expect(result.isFixValid).toBe(true);
  });

  it('falls back to YSH when GPS fix is invalid in live mode', () => {
    const invalidGPS = { ...validGPS, isFixValid: false };
    const result = resolveLocation({
      runtimeMode: 'live',
      isDeviceOnline: true,
      gpsTelemetry: invalidGPS,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('ysh');
    expect(result.latitude).toBe(26.9124);
    expect(result.label).toBe('YSH Base');
    expect(result.isFixValid).toBe(true);
  });

  it('returns source none when device is offline in live mode', () => {
    const result = resolveLocation({
      runtimeMode: 'live',
      isDeviceOnline: false,
      gpsTelemetry: validGPS,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('none');
    expect(result.latitude).toBeNull();
    expect(result.isFixValid).toBe(false);
  });

  it('allows YSH fallback in test mode even if device is offline', () => {
    const result = resolveLocation({
      runtimeMode: 'test',
      isDeviceOnline: false,
      gpsTelemetry: null,
      yshConfig: validYSH,
    });

    expect(result.source).toBe('ysh');
    expect(result.latitude).toBe(26.9124);
    expect(result.isFixValid).toBe(true);
  });
});
