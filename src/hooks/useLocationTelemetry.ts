import { useState, useEffect } from 'react';
import { RawGPSTelemetry, YSHConfig, ResolvedLocation, RuntimeMode } from '../types/location';
import { subscribeYSHConfig } from '../services/yshService';
import { resolveLocation } from '../utils/locationResolver';

interface UseLocationTelemetryProps {
  runtimeMode: RuntimeMode;
  isDeviceOnline: boolean;
  gpsTelemetry: RawGPSTelemetry | null;
  isTestScenarioActive?: boolean;
}

export function useLocationTelemetry({
  runtimeMode,
  isDeviceOnline,
  gpsTelemetry,
  isTestScenarioActive = false,
}: UseLocationTelemetryProps) {
  const [yshConfig, setYshConfig] = useState<YSHConfig | null>(null);
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation>(() =>
    resolveLocation({ runtimeMode, isDeviceOnline, gpsTelemetry, yshConfig: null, isTestScenarioActive })
  );

  useEffect(() => {
    const unsubscribe = subscribeYSHConfig((config) => {
      setYshConfig(config);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const resolved = resolveLocation({
      runtimeMode,
      isDeviceOnline,
      gpsTelemetry,
      yshConfig,
      isTestScenarioActive,
    });
    setResolvedLocation(resolved);
  }, [runtimeMode, isDeviceOnline, gpsTelemetry, yshConfig, isTestScenarioActive]);

  return { resolvedLocation, yshConfig };
}
