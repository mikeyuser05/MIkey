// src/telemetry/context/telemetryReducer.ts
import { TelemetryState, TelemetrySnapshot, ConnectionState } from '../types';

export type TelemetryAction =
  | { type: 'UPDATE_DEVICE_SNAPSHOT'; payload: TelemetrySnapshot }
  | { type: 'SET_CONNECTION_STATUS'; payload: ConnectionState }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_TELEMETRY' };

export const initialState: TelemetryState = {
  devices: {},
  connectionStatus: 'DISCONNECTED',
  error: null
};

export function telemetryReducer(state: TelemetryState, action: TelemetryAction): TelemetryState {
  switch (action.type) {
    case 'UPDATE_DEVICE_SNAPSHOT':
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.payload.deviceId]: action.payload
        }
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'CLEAR_TELEMETRY':
      return {
        ...initialState,
        connectionStatus: state.connectionStatus // Preserve connection status across cache flushes
      };
    default:
      return state;
  }
}
