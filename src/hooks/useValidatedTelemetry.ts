import { useState, useEffect } from 'react';
import { TelemetryValidator, ValidatedTelemetry, RawTelemetry } from '../services/telemetryValidator';
import { patientProfileStore } from '../services/patientProfileStore';

export function useValidatedTelemetry(rawStream: RawTelemetry | null): ValidatedTelemetry | null {
  const [validated, setValidated] = useState<ValidatedTelemetry | null>(null);

  useEffect(() => {
    if (!rawStream) return;
    const profile = patientProfileStore.getProfile();
    const result = TelemetryValidator.validate(rawStream, profile.baselineVitals);
    setValidated(result);
  }, [rawStream]);

  return validated;
}
