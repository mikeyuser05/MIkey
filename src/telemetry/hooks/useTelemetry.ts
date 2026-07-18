// src/telemetry/hooks/useTelemetry.ts
import { useContext, useEffect } from 'react';
import { TelemetryContext } from '../context/TelemetryContext';
import { TelemetrySnapshot, ConnectionState } from '../types';

/**
 * Direct access hook to the internal telemetry transport engine
 */
function useTelemetryContext() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be executed inside a valid TelemetryProvider container');
  }
  return context;
}

/**
 * High-performance hook that binds a component lifecycle to a single device telemetry stream.
 * Automatically handles component mounting and teardown updates.
 */
export function useTelemetry(deviceId: string | null): {
  data: TelemetrySnapshot | null;
  error: string | null;
} {
  const { state, dispatch, service } = useTelemetryContext();

  useEffect(() => {
    if (!deviceId) return;

    // Establish dynamic connection to the repository data stream
    const stopMonitoring = service.monitorDeviceStream(
      deviceId,
      (snapshot) => {
        dispatch({ type: 'UPDATE_DEVICE_SNAPSHOT', payload: snapshot });
      },
      (error) => {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    );

    return () => {
      stopMonitoring();
    };
  }, [deviceId, dispatch, service]);

  return {
    data: deviceId ? (state.devices[deviceId] || null) : null,
    error: state.error
  };
}

/**
 * Extracted connection observer hook targeting network status changes
 */
export function useConnection(): {
  status: ConnectionState;
  error: string | null;
} {
  const { state } = useTelemetryContext();
  return {
    status: state.connectionStatus,
    error: state.error
  };
}

/**
 * Basic connection tracking and diagnostic reporting utility hook
 */
export function useDeviceStatus(deviceId: string): {
  isOnline: boolean;
  lastSeenMs: number;
} {
  const { state } = useTelemetryContext();
  const snapshot = state.devices[deviceId];

  if (!snapshot) {
    return { isOnline: false, lastSeenMs: 0 };
  }

  // Calculate if the hardware has checked in within a 10-second heartbeat window
  const latency = Date.now() - snapshot.lastUpdated;
  const isOnline = latency < 10000;

  return {
    isOnline,
    lastSeenMs: snapshot.lastUpdated
  };
}
