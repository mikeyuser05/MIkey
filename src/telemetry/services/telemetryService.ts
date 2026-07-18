// src/telemetry/services/telemetryService.ts
import { ITelemetryRepository } from '../repository/interfaces';
import { RawTelemetryPacket, TelemetrySnapshot, ConnectionState } from '../types';
import { validateTelemetryPacket, sanitizeTelemetryPacket } from '../utils/validation';

export class TelemetryService {
  private repository: ITelemetryRepository;
  private memoryCache: Map<string, TelemetrySnapshot> = new Map();

  constructor(repository: ITelemetryRepository) {
    this.repository = repository;
  }

  /**
   * Spawns a tracked execution stream, enforcing deep data verification boundaries
   */
  public monitorDeviceStream(
    deviceId: string,
    onSnapshotReceived: (snapshot: TelemetrySnapshot) => void,
    onStreamError: (err: Error) => void
  ): () => void {
    
    // Establish a data pipeline connection to the low-level repository
    const closeStreamPipe = this.repository.subscribeToDevice(
      deviceId,
      (rawPacket: RawTelemetryPacket) => {
        // Step 1: Structural Verification Boundary Check
        if (!validateTelemetryPacket(rawPacket)) {
          onStreamError(new Error(`Validation failure for device frame: ${deviceId}`));
          return;
        }

        // Step 2: Structure Sanitization
        const cleanPacket = sanitizeTelemetryPacket(rawPacket);

        // Step 3: Package into Snapshot
        const snapshot: TelemetrySnapshot = {
          deviceId,
          lastUpdated: Date.now(),
          metrics: cleanPacket
        };

        // Step 4: Update high-speed operational RAM cache
        this.memoryCache.set(deviceId, snapshot);

        // Step 5: Forward verified data to downstream consumers
        onSnapshotReceived(snapshot);
      },
      (error: Error) => {
        onStreamError(error);
      }
    );

    return () => {
      closeStreamPipe();
    };
  }

  /**
   * Directly exposes connection status streams originating from network interfaces
   */
  public monitorConnectionLifecycle(
    onStateChange: (state: ConnectionState) => void
  ): () => void {
    return this.repository.subscribeToConnectionState(onStateChange);
  }

  /**
   * Synchronously inspects local high-speed cache memory for instant layout updates
   */
  public getCachedSnapshot(deviceId: string): TelemetrySnapshot | null {
    return this.memoryCache.get(deviceId) || null;
  }

  /**
   * Empties historical transient execution records
   */
  public clearInternalCache(): void {
    this.memoryCache.clear();
  }
}
