import React, { useState, useEffect } from 'react';
import { evaluateTelemetrySnapshot } from '../services/alertEngine';
import { alertPersistenceManager } from '../services/alertPersistenceManager';
import { emergencyStateMachine } from '../services/emergencyStateMachine';
import { emergencyPreferencesStore } from '../services/emergencyPreferencesStore';
import { emergencyPolicyEngine } from '../services/emergencyPolicyEngine';
import { simulationEngine, SimulationScenario } from '../services/simulationEngine';
import { simulatedVoiceDispatcher } from '../services/simulatedVoiceDispatcher';
import { auditLogger } from '../services/auditLogger';
import { AlertEvaluationResult, EmergencyContact, AuditLogEntry } from '../types/pr11Triage';

export const PR11TriageHub: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>('HEALTHY_BASELINE');
  const [activeEvaluations, setActiveEvaluations] = useState<AlertEvaluationResult[]>([]);
  const [currentState, setCurrentState] = useState(emergencyStateMachine.getState());
  const [preferences, setPreferences] = useState(emergencyPreferencesStore.getPreferences());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(auditLogger.getLogs());
  
  // New Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState<EmergencyContact['relationship']>('PRIMARY_EMERGENCY');

  // Simulation & Telemetry Evaluation Loop
  useEffect(() => {
    simulationEngine.setScenario(selectedScenario);

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const snapshot = simulationEngine.generateSnapshot(currentTime);
      const rawEvals = evaluateTelemetrySnapshot(snapshot, currentTime);
      const persistedEvals = alertPersistenceManager.processEvaluations(rawEvals, currentTime);
      const newState = emergencyStateMachine.evaluateState(persistedEvals, currentTime);

      setActiveEvaluations(persistedEvals);
      setCurrentState(newState);

      // Check emergency policy eligibility
      for (const ev of persistedEvals) {
        if (ev.state === 'EMERGENCY') {
          const decision = emergencyPolicyEngine.evaluatePolicy(ev, currentTime);
          if (decision.actionEligible && decision.targetContact) {
            const dispatch = simulatedVoiceDispatcher.generateSimulatedCall(
              ev,
              decision.targetContact,
              false,
              'Sector 4 Gateway Node',
              currentTime
            );
            auditLogger.log(
              'SIMULATED_ACTION_ATTEMPTED',
              `Dispatched call to ${dispatch.recipientName}: ${dispatch.messageText}`,
              ev.severity,
              ev.nodeId,
              true
            );
          }
        }
      }

      setAuditLogs(auditLogger.getLogs());
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedScenario]);

  const handleScenarioChange = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    alertPersistenceManager.reset();
    auditLogger.log('CONDITION_STARTED', `Simulation scenario switched to ${scenario}`, 'LOW', 'NODE_SIM_01', true);
  };

  const handleToggleCalling = () => {
    const updated = !preferences.emergencyCallingEnabled;
    emergencyPreferencesStore.updatePreferences({ emergencyCallingEnabled: updated });
    setPreferences(emergencyPreferencesStore.getPreferences());
    auditLogger.log('EVENT_CREATED', `Emergency Calling toggled to ${updated ? 'ENABLED' : 'DISABLED'}`, 'MODERATE');
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactPhone) return;

    emergencyPreferencesStore.addContact({
      name: contactName,
      phone: contactPhone,
      relationship: contactRel,
      isPrimary: preferences.contacts.length === 0,
      enabled: true
    });

    setPreferences(emergencyPreferencesStore.getPreferences());
    setContactName('');
    setContactPhone('');
    auditLogger.log('EVENT_CREATED', `Added emergency contact: ${contactName}`);
  };

  const handleRemoveContact = (id: string) => {
    emergencyPreferencesStore.removeContact(id);
    setPreferences(emergencyPreferencesStore.getPreferences());
    auditLogger.log('EVENT_CREATED', `Removed emergency contact ID: ${id}`);
  };

  const handleAcknowledge = () => {
    emergencyStateMachine.acknowledge();
    setCurrentState(emergencyStateMachine.getState());
    auditLogger.log('ACKNOWLEDGED', 'Operator acknowledged active alert condition');
  };

  const handleSuppress = () => {
    emergencyStateMachine.suppress();
    setCurrentState(emergencyStateMachine.getState());
    auditLogger.log('MUTED', 'Operator temporarily suppressed emergency alerts');
  };

  const handleResolve = () => {
    emergencyStateMachine.resolve();
    alertPersistenceManager.reset();
    setCurrentState(emergencyStateMachine.getState());
    auditLogger.log('RESOLVED', 'Operator manually resolved emergency state');
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc' }}>
      <header style={{ marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>
          PR11 — Smart Alert Triage & Emergency Operations Hub
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>
          Deterministic triage pipeline, anti-flicker validation, emergency preferences & audit logging.
        </p>
      </header>

      {/* State Machine Status & Action Bar */}
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        backgroundColor: currentState === 'EMERGENCY' ? '#fef2f2' : currentState === 'WARNING' ? '#fffbebf' : '#f0fdf4',
        border: `2px solid ${currentState === 'EMERGENCY' ? '#ef4444' : currentState === 'WARNING' ? '#f59e0b' : '#22c55e'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#64748b' }}>
              Current Emergency State
            </span>
            <div style={{ fontSize: '28px', fontWeight: '800', marginTop: '4px', color: currentState === 'EMERGENCY' ? '#dc2626' : '#166534' }}>
              {currentState}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleAcknowledge} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: '600' }}>
              Acknowledge
            </button>
            <button onClick={handleSuppress} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer', fontWeight: '600' }}>
              Mute / Suppress
            </button>
            <button onClick={handleResolve} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#22c55e', color: '#ffffff', cursor: 'pointer', fontWeight: '600' }}>
              Resolve State
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Simulation Controls */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: 0 }}>PR11.6 Telemetry Simulator</h2>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
            Select Test Scenario:
          </label>
          <select 
            value={selectedScenario} 
            onChange={(e) => handleScenarioChange(e.target.value as SimulationScenario)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '16px' }}
          >
            <option value="HEALTHY_BASELINE">Healthy Baseline (Normal Vitals)</option>
            <option value="GAS_RISING">Gas Level Rising (Moderate Warning)</option>
            <option value="CRITICAL_GAS">Critical Toxic Gas (Persistent Emergency)</option>
            <option value="SPO2_DROPPING">SpO2 Dropping (Mild Hypoxia)</option>
            <option value="CRITICAL_SPO2">Critical Hypoxia (Persistent Emergency)</option>
            <option value="ABNORMAL_HR">Abnormal Tachycardia (High HR)</option>
            <option value="MISSING_HR">Missing HR (Sensor Error Quality Check)</option>
            <option value="STALE_TELEMETRY">Stale Telemetry (&gt;25s Latency Check)</option>
            <option value="SENSOR_ERROR">Hardware Sensor Error Payload</option>
            <option value="MULTIPLE_ABNORMALITIES">Multiple Simultaneous Critical Abnormalities</option>
          </select>

          <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Active Triage Evaluations</h3>
          {activeEvaluations.map((ev, idx) => (
            <div key={idx} style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#f1f5f9', marginBottom: '8px', fontSize: '13px' }}>
              <div><strong>Category:</strong> {ev.category} | <strong>Quality:</strong> {ev.quality}</div>
              <div><strong>Reason:</strong> {ev.reason}</div>
              <div><strong>Duration:</strong> {(ev.durationMs / 1000).toFixed(1)}s persistent</div>
            </div>
          ))}
        </div>

        {/* Preferences & Contact Registry */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: 0 }}>PR11.4 Emergency Preferences</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontWeight: '600' }}>Enable Outbound Emergency Calling</span>
            <button 
              onClick={handleToggleCalling}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: preferences.emergencyCallingEnabled ? '#22c55e' : '#cbd5e1',
                color: '#ffffff',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {preferences.emergencyCallingEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '12px 0 8px 0' }}>Emergency Contacts (No default fallback)</h3>
          {preferences.contacts.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No emergency contacts configured. System will not trigger calls.</p>
          ) : (
            preferences.contacts.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '6px', fontSize: '13px' }}>
                <div>
                  <strong>{c.name}</strong> ({c.phone}) - {c.relationship} {c.isPrimary && <span style={{ color: '#2563eb' }}>[PRIMARY]</span>}
                </div>
                <button onClick={() => handleRemoveContact(c.id)} style={{ border: 'none', backgroundColor: '#ef4444', color: '#fff', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>
                  Remove
                </button>
              </div>
            ))
          )}

          <form onSubmit={handleAddContact} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input placeholder="Contact Name" value={contactName} onChange={e => setContactName(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <input placeholder="Phone Number" value={contactPhone} onChange={e => setContactPhone(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
            <button type="submit" style={{ padding: '8px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Add Emergency Contact
            </button>
          </form>
        </div>
      </div>

      {/* Central Audit Trail Log */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: 0 }}>PR11.9 Central Audit Trail Log</h2>
        <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '8px' }}>Time</th>
                <th style={{ padding: '8px' }}>Event Type</th>
                <th style={{ padding: '8px' }}>Details</th>
                <th style={{ padding: '8px' }}>Severity</th>
                <th style={{ padding: '8px' }}>Simulated</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px', color: '#64748b' }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td style={{ padding: '8px', fontWeight: '600' }}>{log.eventType}</td>
                  <td style={{ padding: '8px' }}>{log.details}</td>
                  <td style={{ padding: '8px', color: log.severity === 'CRITICAL' ? '#dc2626' : '#475569' }}>{log.severity}</td>
                  <td style={{ padding: '8px' }}>{log.simulated ? 'YES' : 'NO'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};