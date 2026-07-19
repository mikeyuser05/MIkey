/**
 * NOEXCUSE HPO V2: PR4.11.6 Integrated AI Analytics Dashboard Presentation Component
 * Renders unified framework state summaries while maintaining raw card fallback capability.
 */

import React from 'react';
import { useGlobalState } from '../../../context/GlobalContext';

export const HealthAnalyticsDashboard: React.FC = () => {
  const { pipelineData, isLoading, error } = useGlobalState();

  if (isLoading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#666' }}>
        <h3>Loading Integrated Analytics Pipeline Matrix...</h3>
      </div>
    );
  }

  if (error || !pipelineData) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#D32F2F' }}>
        <h3>System Communication Error</h3>
        <p>{error || 'Pipeline returned null structural payload context.'}</p>
      </div>
    );
  }

  const {
    healthState,
    activityState,
    alertState,
    recommendations,
    explainableData,
    dailySummary,
    aiPrompt,
    reportMetadata
  } = pipelineData;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <header style={{ marginBottom: '24px', borderBottom: '1px solid #E5E7EB', paddingBottom: '16px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', color: '#111827' }}>NOEXCUSE HPO V2 AI Control Dashboard</h1>
        <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
          System Latency: <strong>{reportMetadata.pipelineExecutionTimeMs.toFixed(3)} ms</strong> | 
          Last Frame Sync: {new Date(reportMetadata.lastProcessedTimestamp).toLocaleTimeString()}
        </p>
      </header>

      {/* Safety Alert Banner */}
      {alertState.isTriggered && (
        <div style={{ backgroundColor: '#FEF2F2', borderLeft: '4px solid #EF4444', padding: '16px', marginBottom: '24px', borderRadius: '4px' }}>
          <h4 style={{ margin: '0 0 4px 0', color: '#991B1B' }}>CRITICAL HEALTH OR SAFETY INSTABILITY TRIGGERED</h4>
          <p style={{ margin: 0, color: '#B91C1C', fontSize: '14px' }}>{alertState.message}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Bio-Telemetry Status Card */}
        <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>Real-Time Vital Boundaries</h3>
          <p>Heart Rate Vector: <strong>{healthState.heartRateStatus}</strong></p>
          <p>SpO2 Saturation: <strong>{healthState.spo2Status}</strong></p>
          <p>Atmospheric Environment: <strong>{healthState.gasSafetyStatus}</strong></p>
          <div style={{ marginTop: '12px', padding: '8px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold', backgroundColor: healthState.isSafe ? '#ECFDF5' : '#FEF2F2', color: healthState.isSafe ? '#065F46' : '#991B1B' }}>
            System Assessment: {healthState.isSafe ? 'NOMINAL' : 'COMPROMISED'}
          </div>
        </div>

        {/* Activity & Recognition Diagnostics */}
        <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>Kinematic Diagnostics</h3>
          <p>Classified Vector Profile: <strong>{activityState.currentActivity}</strong></p>
          <p>Transformation Confidence: <strong>{(activityState.confidenceScore * 100).toFixed(1)}%</strong></p>
          <p>Calculated Active Time Today: <strong>{dailySummary.totalActiveMinutes} minutes</strong></p>
        </div>

        {/* Dynamic Prescriptions & XAI Rationalization */}
        <div style={{ backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>Prescriptive Directive Actions</h3>
          <p>Primary Action Code: <code>{recommendations.primaryActionCode}</code></p>
          {recommendations.items.map((item, idx) => (
            <div key={idx} style={{ marginTop: '8px', padding: '10px', backgroundColor: '#F9FAFB', borderRadius: '4px', fontSize: '14px' }}>
              <strong>[{item.priority}] {item.actionItem}</strong>
              <div style={{ color: '#6B7280', fontSize: '12px', marginTop: '2px' }}>{item.rationale}</div>
            </div>
          ))}
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#4B5563', fontStyle: 'italic' }}>
            <strong>XAI Justification:</strong> {explainableData.systemLogicJustification}
          </div>
        </div>
      </div>

      {/* AI Prompt Compilation Segment */}
      <section style={{ marginTop: '24px', backgroundColor: '#FFF', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#374151' }}>Structured Context Generation Matrix</h3>
        <textarea
          readOnly
          value={aiPrompt.compiledPayload}
          style={{ width: '100%', height: '100px', fontFamily: 'monospace', padding: '10px', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: '#F9FAFB', resize: 'none', boxSizing: 'border-box' }}
        />
      </section>
    </div>
  );
};