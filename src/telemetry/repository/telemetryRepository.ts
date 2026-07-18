// src/telemetry/repository/telemetryRepository.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, 
  ref, 
  onValue, 
  off, 
  DataSnapshot,
  connectDatabaseEmulator
} from 'firebase/database';
import { ITelemetryRepository } from './interfaces';
import { RawTelemetryPacket, ConnectionState } from '../types';
import { TELEMETRY_CONFIG } from '../config/firebaseConfig';

export class TelemetryRepository implements ITelemetryRepository {
  private db;
  private activeSubscriptions: Map<string, { refPath: any; callbackCount: number }> = new Map();
  private connectionStateCallbacks: Set<(state: ConnectionState) => void> = new Set();
  private currentConnectionState: ConnectionState = 'DISCONNECTED';

  constructor() {
    // Prevent accidental duplication of Firebase Core Application initializations
    const app = getApps().length === 0 
      ? initializeApp({ databaseURL: TELEMETRY_CONFIG.databaseURL }) 
      : getApp();
      
    this.db = getDatabase(app);

    // If local dev environment targets local database testing emulators
    if (process.env.REACT_APP_FIREBASE_DATABASE_EMULATOR === 'true') {
      connectDatabaseEmulator(this.db, '127.0.0.1', 9000);
    }

    this.monitorSystemConnectivity();
  }

  /**
   * System-level WebSocket layer connectivity tracker
   */
  private monitorSystemConnectivity(): void {
    const connectedRef = ref(this.db, '.info/connected');
    
    this.updateConnectionState('CONNECTING');
    
    onValue(connectedRef, (snapshot: DataSnapshot) => {
      const isConnected = snapshot.val() === true;
      if (isConnected) {
        // Enforce online verification checks
        this.updateConnectionState(navigator.onLine ? 'CONNECTED' : 'OFFLINE');
      } else {
        this.updateConnectionState(navigator.onLine ? 'DISCONNECTED' : 'OFFLINE');
      }
    }, () => {
      this.updateConnectionState('ERROR');
    });

    // Mirror native window network state handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.currentConnectionState === 'OFFLINE') this.updateConnectionState('CONNECTED');
      });
      window.addEventListener('offline', () => {
        this.updateConnectionState('OFFLINE');
      });
    }
  }

  private updateConnectionState(nextState: ConnectionState): void {
    if (this.currentConnectionState === nextState) return;
    this.currentConnectionState = nextState;
    this.connectionStateCallbacks.forEach((cb) => cb(nextState));
  }

  /**
   * Spawns exactly one functional network pipe subscription hook per unique target device
   */
  public subscribeToDevice(
    deviceId: string,
    onData: (data: RawTelemetryPacket) => void,
    onError: (error: Error) => void
  ): () => void {
    const databasePath = `${TELEMETRY_CONFIG.rootPath}/${deviceId}`;
    const targetRef = ref(this.db, databasePath);
    
    const existingSub = this.activeSubscriptions.get(deviceId);

    // If exact node listener exists, increment counter tracking to prevent socket allocation duplication
    if (existingSub) {
      existingSub.callbackCount += 1;
    } else {
      this.activeSubscriptions.set(deviceId, { refPath: targetRef, callbackCount: 1 });
    }

    // Bind real-time stream data parser pipeline hook
    const firebaseListenerUnsubscribe = onValue(
      targetRef,
      (snapshot: DataSnapshot) => {
        const rawValue = snapshot.val();
        if (!rawValue) {
          onError(new Error(`No telemetry frames detected at path: ${databasePath}`));
          return;
        }

        try {
          // Explicitly map incoming database elements strictly to target type architecture definitions
          const parsedPacket: RawTelemetryPacket = {
            ts: Number(rawValue.ts ?? Date.now()),
            hr: Number(rawValue.hr ?? 0),
            spo2: Number(rawValue.spo2 ?? 0),
            temp: Number(rawValue.temp ?? 0),
            ax: Number(rawValue.ax ?? 0),
            ay: Number(rawValue.ay ?? 0),
            az: Number(rawValue.az ?? 0),
            batt: Number(rawValue.batt ?? 0),
            rssi: Number(rawValue.rssi ?? 0)
          };
          onData(parsedPacket);
        } catch (err) {
          onError(err instanceof Error ? err : new Error('Malformed database packet structure'));
        }
      },
      (fbError) => {
        onError(fbError);
      }
    );

    // Return the safe un-subscription functional block teardown handler
    return () => {
      const liveSub = this.activeSubscriptions.get(deviceId);
      if (!liveSub) return;

      liveSub.callbackCount -= 1;
      
      // Perform strict underlying platform hook teardown once all listeners request dissociation
      if (liveSub.callbackCount <= 0) {
        off(targetRef);
        firebaseListenerUnsubscribe();
        this.activeSubscriptions.delete(deviceId);
      }
    };
  }

  /**
   * Connect global subscription callbacks to real-time network states
   */
  public subscribeToConnectionState(onStateChange: (state: ConnectionState) => void): () => void {
    this.connectionStateCallbacks.add(onStateChange);
    // Instant flush execution loop providing historical context bootstrap parameters
    onStateChange(this.currentConnectionState);

    return () => {
      this.connectionStateCallbacks.delete(onStateChange);
    };
  }
}
