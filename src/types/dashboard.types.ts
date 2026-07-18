import type { ReactNode } from 'react';

export type VitalStatus = 'normal' | 'warning' | 'critical';
export type TrendDirection = 'up' | 'down' | 'flat';

export interface VitalTrend {
  direction: TrendDirection;
  changeLabel: string;
}

export interface VitalCardData {
  id: string;
  label: string;
  value: string;
  unit?: string;
  status: VitalStatus;
  trend?: VitalTrend;
  helperText?: string;
  accentColorClass: string;
  accentBgClass: string;
}

export type DeviceStatusIconKey =
  'firmware' | 'deviceId' | 'wifi' | 'espNow' | 'battery' | 'signal';

export interface DeviceStatusItem {
  id: string;
  key: DeviceStatusIconKey;
  label: string;
  value: string;
  status: 'online' | 'offline' | 'syncing' | 'warning' | 'error' | 'idle';
}

export type TimelineEventSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: TimelineEventSeverity;
}

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
}

export type SystemComponentKey = 'cloud' | 'device' | 'database' | 'ai';

export interface SystemStatusItem {
  id: string;
  key: SystemComponentKey;
  label: string;
  status: 'online' | 'offline' | 'syncing' | 'warning' | 'error' | 'idle';
  detail: string;
}
