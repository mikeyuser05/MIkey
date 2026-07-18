import type { ReactElement } from 'react';
import { HeartPulse } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function HeartRateCard(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  // 👇 Added the debugging log here
  console.log("HeartRateCard telemetry data:", telemetry);

  return (
    <VitalCard
      icon={<HeartPulse className="h-5 w-5" strokeWidth={2.25} />}
      label="Heart Rate"
      value={telemetry ? telemetry.heartRate.toString() : '--'}
      unit="BPM"
      status={telemetryConnected ? 'normal' : 'offline'}
      trend="0%"
      helperText={
        telemetryConnected
          ? 'Live Firebase'
          : 'Waiting for device...'
      }
      accentColorClass="text-vital-heartRate"
      accentBgClass="bg-vital-heartRate/10"
    />
  );
}
