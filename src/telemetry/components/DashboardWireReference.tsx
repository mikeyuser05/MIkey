// src/telemetry/components/DashboardWireReference.tsx
import React from 'react';
import { TelemetryProvider } from '../context/TelemetryContext';
import { useTelemetry, useConnection } from '../hooks/useTelemetry';

/**
 * ARCHITECTURAL REFERENCE: App.tsx / Index.tsx Root Integration Wire
 * Wrap the root view layout container inside the single telemetry provider boundary.
 */
export const RootApplicationWire: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <TelemetryProvider>
      {children}
    </TelemetryProvider>
  );
};

interface CardProps {
  deviceId: string;
}

/**
 * ARCHITECTURAL REFERENCE: LiveTelemetryCard.tsx Component Wiring
 * Demonstrates updating an existing UI card to consume clean PR3.11 streaming data, 
 * replacing old direct Firebase paths while leaving visual styling completely intact.
 */
export const LiveTelemetryCard: React.FC<CardProps> = ({ deviceId }) => {
  // Pure PR3.11 isolated stream layer connection
  const { data: telemetry, error } = useTelemetry(deviceId);
  const { status: networkStatus } = useConnection();

  if (error) return <div className="alert alert-danger">Network Stream Error: {error}</div>;
  if (!telemetry) return <div className="spinner-border">Connecting Telemetry Pipeline...</div>;

  const { metrics } = telemetry;

  return (
    <div className="card shadow-sm border-left-primary">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="m-0 font-weight-bold text-primary">Device Nodes: {deviceId}</h6>
        <span className={`badge ${networkStatus === 'CONNECTED' ? 'badge-success' : 'badge-warning'}`}>
          {networkStatus}
        </span>
      </div>
      <div className="card-body">
        <div className="row">
          {/* Heart Rate Metric View */}
          <div className="col mr-2">
            <div className="text-xs font-weight-bold text-uppercase mb-1">Heart Rate</div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">{metrics.hr} BPM</div>
          </div>
          
          {/* SpO2 Blood Oxygen Metric View */}
          <div className="col mr-2">
            <div className="text-xs font-weight-bold text-uppercase mb-1">SpO2</div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">{metrics.spo2}%</div>
          </div>

          {/* Core Temperature Metric View */}
          <div className="col mr-2">
            <div className="text-xs font-weight-bold text-uppercase mb-1">Core Temp</div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">{metrics.temp}°C</div>
          </div>

          {/* Battery Status View */}
          <div className="col mr-2">
            <div className="text-xs font-weight-bold text-uppercase mb-1">Battery</div>
            <div className="h5 mb-0 font-weight-bold text-gray-800">{metrics.batt}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
