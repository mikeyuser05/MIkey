import type { ReactElement } from 'react';
import { Wind } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function GasCard(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  return (
    <VitalCard
      icon={<Wind className="h-5 w-5" strokeWidth={2.25} />}
      label="Ambient Gas"
      value={telemetry ? telemetry.gas.toString() : '--'}
      unit="ppm"
      status={telemetryConnected ? 'normal' : 'offline'}
      trend="0%"
      helperText={
        telemetryConnected
          ? 'Live Firebase'
          : 'Waiting for device...'
      }
      accentColorClass="text-status-warning"
      accentBgClass="bg-status-warning/10"
    />
  );
}