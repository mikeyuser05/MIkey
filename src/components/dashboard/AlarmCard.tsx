import type { ReactElement } from 'react';
import { BellRing } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { useGlobalContext } from '@hooks/useGlobalContext';

export function AlarmCard(): ReactElement {
  const { telemetry, telemetryConnected } = useGlobalContext();

  const activeAlarm =
    telemetry &&
    (
      telemetry.heartRate < 45 ||
      telemetry.heartRate > 130 ||
      telemetry.spo2 < 90
    );

  return (
    <VitalCard
      icon={<BellRing className="h-5 w-5" strokeWidth={2.25} />}
      label="Active Alarms"
      value={activeAlarm ? 'YES' : 'NO'}
      unit=""
      status={
        !telemetryConnected
          ? 'offline'
          : activeAlarm
          ? 'warning'
          : 'normal'
      }
      trend=""
      helperText={
        telemetryConnected
          ? 'Calculated from live telemetry'
          : 'Waiting for device...'
      }
      accentColorClass="text-vital-stress"
      accentBgClass="bg-vital-stress/10"
    />
  );
}