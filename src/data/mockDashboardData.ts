import type { DeviceStatusItem, SystemStatusItem, TimelineEvent } from '@app-types/dashboard.types';

export const MOCK_HEART_RATE = {
  value: '78',
  unit: 'bpm',
  status: 'normal' as const,
  trend: { direction: 'up' as const, changeLabel: '+3 bpm vs. last hour' },
  helperText: 'Resting range: 60–100 bpm',
};

export const MOCK_SPO2 = {
  value: '99',
  unit: '%',
  status: 'normal' as const,
  trend: { direction: 'flat' as const, changeLabel: 'Stable over 30 min' },
  helperText: 'Healthy range: 95–100%',
};

export const MOCK_STEPS = {
  value: '6,482',
  unit: 'steps',
  status: 'normal' as const,
  trend: { direction: 'up' as const, changeLabel: '+842 since noon' },
  helperText: 'Daily goal: 10,000 steps',
};

export const MOCK_GAS = {
  value: '412',
  unit: 'ppm',
  status: 'warning' as const,
  trend: { direction: 'up' as const, changeLabel: '+38 ppm vs. baseline' },
  helperText: 'Ambient air quality sensor',
};

export const MOCK_BATTERY = {
  value: '68',
  unit: '%',
  status: 'normal' as const,
  trend: { direction: 'down' as const, changeLabel: '-4% in last hour' },
  helperText: 'Estimated 9h remaining',
};

export const MOCK_CONNECTION = {
  value: 'Stable',
  status: 'normal' as const,
  trend: { direction: 'flat' as const, changeLabel: 'RSSI -52 dBm' },
  helperText: 'ESP-NOW mesh, 2 hops',
};

export const MOCK_ALARM = {
  value: '0',
  unit: 'active',
  status: 'normal' as const,
  trend: { direction: 'flat' as const, changeLabel: 'No alarms in 24h' },
  helperText: 'All thresholds nominal',
};

export const MOCK_TEMPERATURE = {
  value: '36.7',
  unit: '°C',
  status: 'normal' as const,
  trend: { direction: 'up' as const, changeLabel: '+0.2°C vs. baseline' },
  helperText: 'Normal range: 36.1–37.2°C',
};

export const MOCK_DEVICE_STATUS: DeviceStatusItem[] = [
  {
    id: 'firmware',
    key: 'firmware',
    label: 'Firmware',
    value: 'v2.4.1-stable',
    status: 'online',
  },
  {
    id: 'device-id',
    key: 'deviceId',
    label: 'Device ID',
    value: 'HPO-V2-8F3A21',
    status: 'idle',
  },
  {
    id: 'wifi',
    key: 'wifi',
    label: 'WiFi',
    value: 'NOEXCUSE_LAB_5G',
    status: 'online',
  },
  {
    id: 'esp-now',
    key: 'espNow',
    label: 'ESP-NOW Mesh',
    value: '2 peers connected',
    status: 'online',
  },
  {
    id: 'battery',
    key: 'battery',
    label: 'Battery',
    value: '68% · Discharging',
    status: 'warning',
  },
  {
    id: 'signal',
    key: 'signal',
    label: 'Signal Strength',
    value: '-52 dBm · Strong',
    status: 'online',
  },
];

export const MOCK_RECENT_EVENTS: TimelineEvent[] = [
  {
    id: 'evt-1',
    title: 'Device reconnected',
    description: 'HPO-V2-8F3A21 rejoined the ESP-NOW mesh after a brief signal drop.',
    timestamp: '2 minutes ago',
    severity: 'success',
  },
  {
    id: 'evt-2',
    title: 'Elevated gas reading',
    description: 'Ambient gas sensor reported 412 ppm, above the 400 ppm baseline.',
    timestamp: '18 minutes ago',
    severity: 'warning',
  },
  {
    id: 'evt-3',
    title: 'Firmware check completed',
    description: 'Background update check confirmed device is running v2.4.1-stable.',
    timestamp: '1 hour ago',
    severity: 'info',
  },
  {
    id: 'evt-4',
    title: 'Battery below 70%',
    description: 'Battery level dropped to 68%. Estimated 9 hours of remaining runtime.',
    timestamp: '2 hours ago',
    severity: 'warning',
  },
  {
    id: 'evt-5',
    title: 'Daily sync completed',
    description: 'All vitals and device telemetry synced successfully to the cloud.',
    timestamp: '6 hours ago',
    severity: 'success',
  },
];

export const MOCK_SYSTEM_STATUS: SystemStatusItem[] = [
  {
    id: 'cloud',
    key: 'cloud',
    label: 'Cloud Sync',
    status: 'online',
    detail: 'Last sync 6h ago',
  },
  {
    id: 'device',
    key: 'device',
    label: 'Wearable Device',
    status: 'online',
    detail: 'Connected via ESP-NOW',
  },
  {
    id: 'database',
    key: 'database',
    label: 'Database',
    status: 'online',
    detail: 'Firestore operational',
  },
  {
    id: 'ai',
    key: 'ai',
    label: 'AI Insights',
    status: 'idle',
    detail: 'Not enabled in this build',
  },
];
