/**
 * PR10.4: Multi-Device Architecture Types
 */

export type DeviceType = "ESP32_WEARABLE" | "MOBILE_APP" | "WEB_DASHBOARD" | "EDGE_GATEWAY";

export interface DeviceNode {
    deviceId: string;
    deviceType: DeviceType;
    lastSyncTimestamp: number;
    firmwareVersion: string;
    isOnline: boolean;
}

export interface SyncPayload {
    syncId: string;
    sourceDeviceId: string;
    targetDeviceId: string;
    recordsTransferred: number;
    status: "SUCCESS" | "PARTIAL" | "FAILED";
    timestamp: number;
}
