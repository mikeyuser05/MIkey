import type { ReactElement } from 'react';
import { Wifi } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function ConnectionCard(): ReactElement {
  const { telemetryConnected } = useGlobalContext();

  return (
    <VitalCard
      icon={<Wifi className="h-5 w-5" strokeWidth={2.25} />}
      label="Connection"
      value={telemetryConnected ? 'ONLINE' : 'OFFLINE'}
      status={telemetryConnected ? 'normal' : 'offline'}
      trend=""
      helperText={
        telemetryConnected
          ? 'Firebase Connected'
          : 'Waiting for Firebase...'
      }
      accentColorClass="text-primary-600 dark:text-primary-400"
      accentBgClass="bg-primary-600/10"
    />
  );
}