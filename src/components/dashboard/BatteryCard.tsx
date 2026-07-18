import type { ReactElement } from 'react';
import { BatteryMedium } from 'lucide-react';
import { VitalCard } from './VitalCard';
import { MOCK_BATTERY } from '@/data/mockDashboardData';

export function BatteryCard(): ReactElement {
  return (
    <VitalCard
      icon={<BatteryMedium className="h-5 w-5" strokeWidth={2.25} />}
      label="Device Battery"
      value={MOCK_BATTERY.value}
      unit={MOCK_BATTERY.unit}
      status={MOCK_BATTERY.status}
      trend={MOCK_BATTERY.trend}
      helperText={MOCK_BATTERY.helperText}
      accentColorClass="text-status-info"
      accentBgClass="bg-status-info/10"
    />
  );
}
