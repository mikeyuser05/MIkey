/**
 * NOEXCUSE HPO V2 - Multi-Node Fleet Manager Engine (PR15)
 * Aggregates multi-device telemetry, computes global priority queues, and routes remote commands.
 */

import { FleetNodeStatus, RemoteCommandType } from '../types/pr15Fleet';
import { evaluateTelemetrySnapshot } from './alertEngine';
import { geoService } from './geoService';
import { auditLogger } from './auditLogger';

class MultiNodeFleetManager {
  private nodes: Map<string, FleetNodeStatus> = new Map();

  constructor() {
    this.seedDefaultNodes();
  }

  private seedDefaultNodes() {
    const now = Date.now();
    const defaultNodes: FleetNodeStatus[] = [
      {
        nodeId: 'NODE_001',
        subjectName: 'Alpha Unit (Lead)',
        assignedZone: 'Sector 4 — Processing Lab',
        emergencyState: 'NORMAL',
        heartRate: 74,
        spO2: 98,
        gasPpm: 110,
        batteryPercent: 88,
        lastUpdated: now,
        activeAlerts: [],
        gps: { latitude: 26.4491, longitude: 74.6321, accuracyMeters: 4.2, satellites: 8, hasFix: true, timestamp: now }
      },
      {
        nodeId: 'NODE_002',
        subjectName: 'Bravo Unit (Substation)',
        assignedZone: 'Sector 2 — High Voltage Substation',
        emergencyState: 'NORMAL',
        heartRate: 82,
        spO2: 97,
        gasPpm: 145,
        batteryPercent: 64,
        lastUpdated: now,
        activeAlerts: [],
        gps: { latitude: 26.4530, longitude: 74.6370, accuracyMeters: 5.0, satellites: 7, hasFix: true, timestamp: now }
      },
      {
        nodeId: 'NODE_003',
        subjectName: 'Charlie Unit (Perimeter)',
        assignedZone: 'Sector 1 — Outdoor Perimeter',
        emergencyState: 'NORMAL',
        heartRate: 68,
        spO2: 99,
        gasPpm: 95,
        batteryPercent: 92,
        lastUpdated: now,
        activeAlerts: [],
        gps: { latitude: 26.4420, longitude: 74.6250, accuracyMeters: 3.8, satellites: 9, hasFix: true, timestamp: now }
      }
    ];

    defaultNodes.forEach(n => this.nodes.set(n.nodeId, n));
  }

  public updateNodeTelemetry(
    nodeId: string,
    heartRate: number,
    spO2: number,
    mq9GasRaw: number,
    batteryPercent: number,
    gps: FleetNodeStatus['gps'],
    currentTime: number = Date.now()
  ): FleetNodeStatus {
    const existing = this.nodes.get(nodeId) || {
      nodeId,
      subjectName: `Field Unit ${nodeId}`,
      assignedZone: 'Unmapped Area',
      emergencyState: 'NORMAL' as const,
      heartRate,
      spO2,
      gasPpm: Math.round(mq9GasRaw / 4),
      batteryPercent,
      lastUpdated: currentTime,
      activeAlerts: [],
      gps
    };

    // Run Triage Engine for Node
    const snapshot = {
      nodeId,
      heartRate,
      spO2,
      mq9GasRaw,
      batteryPercent,
      latencyMs: 50,
      sensorError: false,
      timestamp: currentTime
    };

    const alerts = evaluateTelemetrySnapshot(snapshot, currentTime);
    const geoPayload = geoService.generateGeoDispatchPayload(gps, currentTime);

    // Compute Emergency State based on active alerts
    let state: FleetNodeStatus['emergencyState'] = 'NORMAL';
    if (alerts.some(a => a.state === 'EMERGENCY')) {
      state = 'EMERGENCY';
    } else if (alerts.some(a => a.state === 'WARNING')) {
      state = 'WARNING';
    }

    const updatedNode: FleetNodeStatus = {
      ...existing,
      heartRate,
      spO2,
      gasPpm: Math.round(mq9GasRaw / 4),
      batteryPercent,
      assignedZone: geoPayload.zoneName,
      emergencyState: state,
      activeAlerts: alerts,
      gps,
      lastUpdated: currentTime
    };

    this.nodes.set(nodeId, updatedNode);
    return updatedNode;
  }

  public getSortedFleet(): FleetNodeStatus[] {
    const fleetList = Array.from(this.nodes.values());
    
    // Sort by Threat Level Priority (EMERGENCY > WARNING > NORMAL)
    const priorityWeight = { EMERGENCY: 3, WARNING: 2, NORMAL: 1 };
    
    return fleetList.sort((a, b) => priorityWeight[b.emergencyState] - priorityWeight[a.emergencyState]);
  }

  public issueRemoteCommand(nodeId: string, command: RemoteCommandType): void {
    auditLogger.log('SIMULATED_ACTION_ATTEMPTED', `Remote Command [${command}] dispatched to Node ${nodeId}`, 'MODERATE', nodeId, true);
  }
}

export const multiNodeFleetManager = new MultiNodeFleetManager();
