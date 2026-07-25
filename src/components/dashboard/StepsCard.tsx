import type { ReactElement } from 'react';
import { Footprints } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function StepsCard(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  const stepsValue =
    telemetry && telemetry.steps !== undefined && telemetry.steps !== null
      ? telemetry.steps.toString()
      : '0';

  return (
    <VitalCard
      icon={<Footprints className="h-5 w-5" strokeWidth={2.25} />}
      label="Steps Today"
      value={stepsValue}
      unit="steps"
      status={(telemetryConnected ? 'normal' : 'warning') as any}
      trend={{ direction: 'up' as any, changeLabel: '0%' }}
      helperText={
        telemetryConnected
          ? 'Live Firebase Stream (LGN.8)'
          : 'Waiting for device...'
      }
      accentColorClass="text-vital-steps"
      accentBgClass="bg-vital-steps/10"
    />
  );
}