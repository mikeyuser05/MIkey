/**
 * NOEXCUSE HPO V2 - PR16 Offline Storage & Sync Monitor UI
 */

import React, { useState, useEffect } from 'react';
import { offlineSyncEngine } from '../services/offlineSyncEngine';
import { NetworkConnectivityStatus } from '../types/pr16Offline';

export const PR16OfflineSyncMonitor: React.FC = () => {
  const [status, setStatus] = useState<NetworkConnectivityStatus>(offlineSyncEngine.getStatus());
  const [simulatedDrop, setSimulatedDrop] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // If simulated network drop is active, buffer mock frames
      if (simulatedDrop) {
        offlineSyncEngine.bufferFrame({
          nodeId: 'NODE_OFFLINE_LAB',
          heartRate: 78,
          spO2: 98,
          mq9GasRaw: 400,
          batteryPercent: 85,
          latencyMs: 12,
          sensorError: false,
          timestamp: Date.now()
        });
      }

      setStatus(offlineSyncEngine.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, [simulatedDrop]);

  const handleToggleOfflineSimulation = () => {
    const nextState = !simulatedDrop;
    setSimulatedDrop(nextState);
    offlineSyncEngine.forceOfflineToggle(nextState);
  };

  const handleManualSync = async () => {
    await offlineSyncEngine.flushQueue();
    setStatus(offlineSyncEngine.getStatus());
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '24px' }}>
      <header style={{ marginBottom: '20px', borderBottom: '2px solid #cbd5e1', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#0f172a' }}>
            PR16 — Edge Resilience & Offline Sync Recovery
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '14px' }}>
            Telemetry buffering during connection loss with automatic batch recovery.
          </p>
        </div>
        <div
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: status.isOnline ? '#22c55e' : '#ef4444',
            color: '#ffffff'
          }}
        >
          {status.isOnline ? 'ONLINE (LIVE TRANSMISSION)' : 'OFFLINE (BUFFERING)'}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>PENDING BUFFERED FRAMES</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>
            {status.pendingQueueSize}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>SYNC ENGINE STATE</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: status.isSyncing ? '#2563eb' : '#334155', marginTop: '6px' }}>
            {status.isSyncing ? 'FLUSHING BUFFER...' : 'IDLE / READY'}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>LAST CONNECTION CHECK</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', marginTop: '8px' }}>
            {new Date(status.lastOnlineAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleToggleOfflineSimulation}
          style={{
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: simulatedDrop ? '#22c55e' : '#f59e0b',
            color: '#ffffff',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {simulatedDrop ? 'Restore Network Connection' : 'Simulate Network Outage'}
        </button>

        <button
          onClick={handleManualSync}
          disabled={!status.isOnline || status.pendingQueueSize === 0}
          style={{
            padding: '10px 18px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: status.isOnline && status.pendingQueueSize > 0 ? '#2563eb' : '#cbd5e1',
            color: '#ffffff',
            fontWeight: 'bold',
            cursor: status.isOnline && status.pendingQueueSize > 0 ? 'pointer' : 'not-allowed'
          }}
        >
          Force Manual Sync Drain
        </button>
      </div>
    </div>
  );
};
