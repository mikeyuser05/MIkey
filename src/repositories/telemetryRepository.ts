import {
  telemetryService,
  type TelemetryPayload,
} from '../services/firebase/telemetryService';

export interface TelemetryState {
  data: TelemetryPayload | null;
  connected: boolean;
  loading: boolean;
}

export type TelemetryListener = (state: TelemetryState) => void;

class TelemetryRepository {
  subscribe(listener: TelemetryListener): () => void {
    listener({
      data: null,
      connected: false,
      loading: true,
    });

    const unsubscribe = telemetryService.subscribe(
      (payload: TelemetryPayload) => {
        console.log("Repository received", payload);
        listener({
          data: payload,
          connected: true,
          loading: false,
        });
      },
    );

    return () => {
      unsubscribe();

      listener({
        data: null,
        connected: false,
        loading: false,
      });
    };
  }
}

export const telemetryRepository = new TelemetryRepository();