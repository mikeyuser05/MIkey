// src/telemetry/repository/interfaces.ts
import { RawTelemetryPacket, ConnectionState } from '../types';

export interface ITelemetryRepository {
  /**
   * Spawns exactly one subscription to a specific device data stream path.
   * Returns an un-subscription teardown function cleanup handle.
   */
  subscribeToDevice(
    deviceId: string,
    onData: (data: RawTelemetryPacket) => void,
    onError: (error: Error) => void
  ): () => void;

  /**
   * Tracks the overall WebSocket/Realtime connection lifecycle.
   */
  subscribeToConnectionState(
    onStateChange: (state: ConnectionState) => void
  ): () => void;
}
