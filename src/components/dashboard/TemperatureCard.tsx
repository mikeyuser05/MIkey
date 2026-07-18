import type { ReactElement } from 'react';
import { Thermometer } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { MOCK_TEMPERATURE } from '@/data/mockDashboardData';

export function TemperatureCard(): ReactElement {
  return (
    <VitalCard
      icon={<Thermometer className="h-5 w-5" strokeWidth={2.25} />}
      label="Body Temperature"
      value={MOCK_TEMPERATURE.value}
      unit={MOCK_TEMPERATURE.unit}
      status={MOCK_TEMPERATURE.status}
      trend={MOCK_TEMPERATURE.trend}
      helperText={MOCK_TEMPERATURE.helperText}
      accentColorClass="text-vital-temperature"
      accentBgClass="bg-vital-temperature/10"
    />
  );
}
