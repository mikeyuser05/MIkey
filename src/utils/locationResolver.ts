import { RawGPSTelemetry, YSHConfig, ResolvedLocation, RuntimeMode } from '@/types/location';
import { validateCoordinates } from '@/services/yshService';

interface ResolveLocationParams {
  runtimeMode: RuntimeMode;
  isDeviceOnline: boolean;
  gpsTelemetry: RawGPSTelemetry | null;
  yshConfig: YSHConfig | null;
  isTestScenarioActive?: boolean;
}

export const resolveLocation = ({
  runtimeMode,
  isDeviceOnline,
  gpsTelemetry,
  yshConfig,
  isTestScenarioActive = false,
}: ResolveLocationParams): ResolvedLocation => {
  const realSatellites = gpsTelemetry?.satellites ?? 0;

  const hasValidGPS =
    gpsTelemetry !== null &&
    gpsTelemetry.isFixValid &&
    gpsTelemetry.latitude !== null &&
    gpsTelemetry.longitude !== null &&
    validateCoordinates(
      gpsTelemetry.latitude,
      gpsTelemetry.longitude,
      gpsTelemetry.altitude ?? 0
    );

  const hasValidYSH =
    yshConfig !== null &&
    yshConfig.enabled &&
    validateCoordinates(yshConfig.latitude, yshConfig.longitude, yshConfig.altitude);

  if (runtimeMode === 'live') {
    if (!isDeviceOnline) {
      return {
        latitude: null,
        longitude: null,
        altitude: null,
        satellites: 0,
        source: 'none',
        isFixValid: false,
      };
    }

    if (hasValidGPS) {
      return {
        latitude: gpsTelemetry!.latitude,
        longitude: gpsTelemetry!.longitude,
        altitude: gpsTelemetry!.altitude ?? 0,
        satellites: realSatellites,
        source: 'gps',
        isFixValid: true,
      };
    }

    if (hasValidYSH) {
      return {
        latitude: yshConfig!.latitude,
        longitude: yshConfig!.longitude,
        altitude: yshConfig!.altitude,
        satellites: yshConfig!.satellites ?? realSatellites,
        source: 'ysh',
        label: yshConfig!.label,
        isFixValid: true,
      };
    }

    return {
      latitude: null,
      longitude: null,
      altitude: null,
      satellites: realSatellites,
      source: 'none',
      isFixValid: false,
    };
  }

  if (runtimeMode === 'test') {
    if (hasValidGPS && isDeviceOnline) {
      return {
        latitude: gpsTelemetry!.latitude,
        longitude: gpsTelemetry!.longitude,
        altitude: gpsTelemetry!.altitude ?? 0,
        satellites: realSatellites,
        source: 'gps',
        isFixValid: true,
      };
    }

    if (hasValidYSH) {
      return {
        latitude: yshConfig!.latitude,
        longitude: yshConfig!.longitude,
        altitude: yshConfig!.altitude,
        satellites: yshConfig!.satellites ?? realSatellites,
        source: 'ysh',
        label: yshConfig!.label,
        isFixValid: true,
      };
    }
  }

  return {
    latitude: null,
    longitude: null,
    altitude: null,
    satellites: 0,
    source: 'none',
    isFixValid: false,
  };
};
