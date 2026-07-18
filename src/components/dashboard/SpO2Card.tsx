import type { ReactElement } from 'react';
import { Droplets } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function SpO2Card(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  return (
    <VitalCard
      icon={<Droplets className="h-5 w-5" strokeWidth={2.25} />}
      label="Blood Oxygen (SpO₂)"
      value={telemetry ? telemetry.spo2.toString() : '--'}
      unit="%"
      status={telemetryConnected ? 'normal' : 'offline'}
      trend="0%"
      helperText={
        telemetryConnected
          ? 'Live Firebase'
          : 'Waiting for device...'
      }
      accentColorClass="text-vital-spo2"
      accentBgClass="bg-vital-spo2/10"
    />
  );
}