import type { ReactElement } from 'react';
import { Wind } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function GasCard(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  const gasValue =
    telemetry && telemetry.gas !== undefined && telemetry.gas !== null
      ? telemetry.gas.toString()
      : '0';

  return (
    <VitalCard
      icon={<Wind className="h-5 w-5" strokeWidth={2.25} />}
      label="Ambient Gas"
      value={gasValue}
      unit="ppm"
      status={(telemetryConnected ? 'normal' : 'warning') as any}
      trend={{ direction: 'up' as any, changeLabel: '0%' }}
      helperText={
        telemetryConnected
          ? 'Live Firebase Stream (LGN.8)'
          : 'Waiting for device...'
      }
      accentColorClass="text-status-warning"
      accentBgClass="bg-status-warning/10"
    />
  );
}