/**
 * NOEXCUSE HPO V2 - PR15 Multi-Node Command Center & Remote Operations UI
 */

import React, { useState, useEffect } from 'react';
import { multiNodeFleetManager } from '../services/multiNodeFleetManager';
import { FleetNodeStatus, RemoteCommandType } from '../types/pr15Fleet';

export const PR15MultiNodeCommandCenter: React.FC = () => {
  const [fleet, setFleet] = useState<FleetNodeStatus[]>(multiNodeFleetManager.getSortedFleet());

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight drift in live node telemetry across fleet
      const now = Date.now();
      
      // Node 1: Normal
      multiNodeFleetManager.updateNodeTelemetry(
        'NODE_001', 
        72 + Math.round((Math.random() - 0.5) * 4), 
        98, 
        440, 
        87, 
        { latitude: 26.4491, longitude: 74.6321, accuracyMeters: 4.2, satellites: 8, hasFix: true, timestamp: now },
        now
      );

      // Node 2: Substation (Simulate elevated gas or heart rate occasionally)
      multiNodeFleetManager.updateNodeTelemetry(
        'NODE_002', 
        110 + Math.round((Math.random() - 0.5) * 6), 
        94, 
        680, 
        62, 
        { latitude: 26.4530, longitude: 74.6370, accuracyMeters: 5.0, satellites: 7, hasFix: true, timestamp: now },
        now
      );

      // Node 3: Perimeter
      multiNodeFleetManager.updateNodeTelemetry(
        'NODE_003', 
        68 + Math.round((Math.random() - 0.5) * 2), 
        99, 
        380, 
        91, 
        { latitude: 26.4420, longitude: 74.6250, accuracyMeters: 3.8, satellites: 9, hasFix: true, timestamp: now },
        now
      );

      setFleet(multiNodeFleetManager.getSortedFleet());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleCommand = (nodeId: string, command: RemoteCommandType) => {
    multiNodeFleetManager.issueRemoteCommand(nodeId, command);
    alert(`Command [${command}] sent to ${nodeId}`);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #cbd5e1', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
            PR15 — Multi-Node Command Center & Remote Operations
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Fleet aggregation, threat-matrix prioritization, and remote field node control.
          </p>
        </div>
        <div style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: '#ffffff', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
          Active Fleet Units: {fleet.length}
        </div>
      </header>

      {/* Fleet Node Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {fleet.map(node => (
          <div
            key={node.nodeId}
            style={{
              borderRadius: '10px',
              padding: '16px',
              border: `2px solid ${
                node.emergencyState === 'EMERGENCY' ? '#ef4444' : node.emergencyState === 'WARNING' ? '#f59e0b' : '#22c55e'
              }`,
              backgroundColor: node.emergencyState === 'EMERGENCY' ? '#fef2f2' : node.emergencyState === 'WARNING' ? '#fffbebf' : '#f0fdf4'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '16px', color: '#0f172a' }}>{node.subjectName}</strong>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: node.emergencyState === 'EMERGENCY' ? '#dc2626' : node.emergencyState === 'WARNING' ? '#d97706' : '#16a34a',
                  color: '#ffffff'
                }}
              >
                {node.emergencyState}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              ID: {node.nodeId} | Zone: <strong>{node.assignedZone}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              <div>Heart Rate: <strong>{node.heartRate} BPM</strong></div>
              <div>SpO2: <strong>{node.spO2}%</strong></div>
              <div>Gas Level: <strong>{node.gasPpm} PPM</strong></div>
              <div>Battery: <strong style={{ color: node.batteryPercent < 20 ? '#ef4444' : '#16a34a' }}>{node.batteryPercent}%</strong></div>
            </div>

            {/* Remote Controls */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => handleCommand(node.nodeId, 'PING_BUZZER')} style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                Ping Buzzer
              </button>
              <button onClick={() => handleCommand(node.nodeId, 'FORCE_MUTE')} style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                Remote Mute
              </button>
              <button onClick={() => handleCommand(node.nodeId, 'TRIGGER_MANUAL_DISPATCH')} style={{ flex: 1, padding: '6px', fontSize: '11px', fontWeight: 'bold', border: 'none', borderRadius: '4px', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                Dispatch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
