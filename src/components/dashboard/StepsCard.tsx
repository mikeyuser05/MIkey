import type { ReactElement } from 'react';
import { Footprints } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function StepsCard(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  return (
    <VitalCard
      icon={<Footprints className="h-5 w-5" strokeWidth={2.25} />}
      label="Steps Today"
      value={telemetry ? telemetry.steps.toString() : '--'}
      unit="steps"
      status={telemetryConnected ? 'normal' : 'offline'}
      trend="0%"
      helperText={
        telemetryConnected
          ? 'Live Firebase'
          : 'Waiting for device...'
      }
      accentColorClass="text-vital-steps"
      accentBgClass="bg-vital-steps/10"
    />
  );
}