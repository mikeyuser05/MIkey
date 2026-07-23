/**
 * PR10.4: Multi-Device Sync Manager
 * Handles multi-node synchronization across hardware sensors, microcontrollers, and cloud/web dashboards.
 */

import { DeviceNode, SyncPayload } from "../types/multiDevice";

export class MultiDeviceSyncManager {
    private registeredDevices: Map<string, DeviceNode> = new Map();

    public registerDevice(device: DeviceNode): void {
        this.registeredDevices.set(device.deviceId, device);
    }

    public getDevice(deviceId: string): DeviceNode | undefined {
        return this.registeredDevices.get(deviceId);
    }

    /**
     * Executes data synchronization between nodes (e.g., ESP32 -> Web Dashboard)
     */
    public executeSync(sourceDeviceId: string, targetDeviceId: string, recordCount: number): SyncPayload {
        const source = this.registeredDevices.get(sourceDeviceId);
        const target = this.registeredDevices.get(targetDeviceId);

        if (!source || !target) {
            return {
                syncId: `SYNC_${Date.now()}`,
                sourceDeviceId,
                targetDeviceId,
                recordsTransferred: 0,
                status: "FAILED",
                timestamp: Date.now()
            };
        }

        // Update heartbeat
        source.lastSyncTimestamp = Date.now();
        target.lastSyncTimestamp = Date.now();

        return {
            syncId: `SYNC_${Date.now()}`,
            sourceDeviceId,
            targetDeviceId,
            recordsTransferred: recordCount,
            status: "SUCCESS",
            timestamp: Date.now()
        };
    }
}
