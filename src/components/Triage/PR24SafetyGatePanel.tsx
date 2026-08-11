import React, { useState } from 'react';
import { pr24SafetyGateService } from '../../services/emergencyCallSafetyGateService';
import { EmergencyCallPolicy } from '../../types/triage';
import { emergencyVoiceBackendClient, BackendCallExecutionResult } from '../../services/emergencyVoiceBackendClient';

export const PR24SafetyGatePanel: React.FC = () => {
  const [gateState, setGateState] = useState(pr24SafetyGateService.getState());
  const [simulatedDuration, setSimulatedDuration] = useState<number>(35); // Default 35s (> 30s threshold)
  const [dispatchResult, setDispatchResult] = useState<BackendCallExecutionResult | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleRunSimulation = (
    severity: 'NORMAL' | 'MODERATE' | 'CRITICAL',
    telemetryValid: boolean = true,
    sensorFault: boolean = false,
    durationSec: number = simulatedDuration
  ) => {
    const now = Date.now();
    const eventFirstSeen = now - durationSec * 1000;

    pr24SafetyGateService.evaluateCallEligibility({
      eventId: `sim_evt_${Math.floor(Math.random() * 10000)}`,
      severity,
      telemetryValid,
      sensorFaultState: sensorFault,
      eventFirstSeenTimestamp: eventFirstSeen,
      currentTimestamp: now,
      policy: gateState.policy,
      cooldown: gateState.cooldown,
      activeCallInProgress: gateState.activeCallInProgress,
      isSuppressedOrMuted: gateState.policy.isMuted,
      lastProcessedEventId: null,
    });

    setGateState(pr24SafetyGateService.getState());
  };

  const togglePolicy = (key: keyof EmergencyCallPolicy) => {
    const currentValue = gateState.policy[key];
    if (typeof currentValue === 'boolean') {
      pr24SafetyGateService.updatePolicy({ [key]: !currentValue });
      setGateState(pr24SafetyGateService.getState());
    }
  };

  const decision = gateState.lastDecision;

  const handleTriggerBackendCall = async () => {
    if (!decision || decision.status !== 'CALL_ELIGIBLE') return;
    setIsDispatching(true);

    const targetPhone = gateState.policy.primaryContact?.phone || '+15550199';
    const res = await emergencyVoiceBackendClient.requestOutboundCall(decision, targetPhone);

    setDispatchResult(res);
    setIsDispatching(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              PR24
            </span>
            <h3 className="text-lg font-bold text-white">Emergency Call Safety Gate</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic Call Eligibility System • Simulation Mode Active (No Real Outbound Dialing)
          </p>
        </div>

        {/* Live Decision Badge */}
        {decision && (
          <div className="text-right">
            <span
              className={`inline-block px-3 py-1 text-xs font-black tracking-wider uppercase rounded-full border ${
                decision.status === 'CALL_ELIGIBLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {decision.status === 'CALL_ELIGIBLE' ? 'CALL ELIGIBLE' : 'CALL BLOCKED'}
            </span>
            <div className="text-[10px] text-slate-500 mt-1">
              Code: <code className="text-slate-300">{decision.reasonCode}</code>
            </div>
          </div>
        )}
      </div>

      {/* Decision Audit Log Box */}
      {decision ? (
        <div
          className={`p-4 rounded-lg border text-sm ${
            decision.status === 'CALL_ELIGIBLE'
              ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
              : 'bg-slate-950/60 border-slate-800 text-slate-300'
          }`}
        >
          <div className="font-semibold mb-1 flex items-center justify-between">
            <span>Audit Explanation:</span>
            <span className="text-xs font-normal opacity-70">
              Event Persistence: {Math.floor(decision.persistenceDurationMs / 1000)}s
            </span>
          </div>
          <p className="text-xs leading-relaxed opacity-90">{decision.reasonExplanation}</p>
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
          Run a simulation test scenario below to evaluate safety gate rules.
        </div>
      )}

      {/* PR25 Voice Backend Dispatch */}
      {decision?.status === 'CALL_ELIGIBLE' && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-lg space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase">PR25 Voice Backend Dispatch Ready</h4>
              <p className="text-[11px] text-slate-400">PR24 Safety Gate passed. Safe to trigger server call request.</p>
            </div>
            <button
              onClick={handleTriggerBackendCall}
              disabled={isDispatching}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded shadow-lg transition disabled:opacity-50"
            >
              {isDispatching ? 'Dispatching...' : 'Dispatch Backend Call'}
            </button>
          </div>
          {dispatchResult && (
            <div
              className={`p-3 rounded text-xs font-mono border ${
                dispatchResult.success
                  ? 'bg-slate-950 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/50 border-rose-800 text-rose-300'
              }`}
            >
              <div>Provider: {dispatchResult.provider} | Status: {dispatchResult.status}</div>
              <div>SID: {dispatchResult.callSid || 'N/A'}</div>
              <div className="text-[10px] opacity-80 mt-1">{dispatchResult.message}</div>
            </div>
          )}
        </div>
      )}

      {/* Policy Controls & Cooldown Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-3">
          <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
            Safety Controls & Policy
          </h4>
          <div className="flex items-center justify-between">
            <span>Global Calling Enabled</span>
            <button
              onClick={() => togglePolicy('callingEnabled')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                gateState.policy.callingEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {gateState.policy.callingEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span>Alert Mute / Suppression</span>
            <button
              onClick={() => togglePolicy('isMuted')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                gateState.policy.isMuted
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {gateState.policy.isMuted ? 'MUTED' : 'ACTIVE'}
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-lg space-y-3">
          <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
            Dispatch Roster & Cooldown
          </h4>
          <div className="flex justify-between">
            <span className="text-slate-400">Primary Contact:</span>
            <span className="font-mono text-slate-200">
              {gateState.policy.primaryContact?.name} ({gateState.policy.primaryContact?.phone})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Active Cooldown State:</span>
            <button
              onClick={() => {
                if (gateState.cooldown.active) {
                  pr24SafetyGateService.clearCooldown();
                } else {
                  pr24SafetyGateService.triggerCooldown(300);
                }
                setGateState(pr24SafetyGateService.getState());
              }}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                gateState.cooldown.active
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-400'
              }`}
            >
              {gateState.cooldown.active ? 'COOLDOWN ACTIVE' : 'CLEAR'}
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Control Matrix */}
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
            PR24 Simulation Test Matrix
          </h4>
          <div className="flex items-center gap-2 text-xs">
            <label className="text-slate-400">Simulated Event Duration:</label>
            <input
              type="number"
              value={simulatedDuration}
              onChange={(e) => setSimulatedDuration(Number(e.target.value))}
              className="w-16 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-white"
            />
            <span className="text-slate-500">sec</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => handleRunSimulation('NORMAL')}
            className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition"
          >
            Test NORMAL Severity
          </button>
          <button
            onClick={() => handleRunSimulation('MODERATE')}
            className="px-3 py-2 rounded bg-amber-950/40 hover:bg-amber-900/50 text-xs font-medium text-amber-300 border border-amber-800/50 transition"
          >
            Test MODERATE Severity
          </button>
          <button
            onClick={() => handleRunSimulation('CRITICAL', true, false, 10)}
            className="px-3 py-2 rounded bg-rose-950/40 hover:bg-rose-900/50 text-xs font-medium text-rose-300 border border-rose-800/50 transition"
          >
            Test CRITICAL (&lt; 30s)
          </button>
          <button
            onClick={() => handleRunSimulation('CRITICAL', true, false, 35)}
            className="px-3 py-2 rounded bg-emerald-900/50 hover:bg-emerald-800/60 text-xs font-bold text-emerald-200 border border-emerald-600/60 transition shadow-lg shadow-emerald-950/50"
          >
            Simulate Valid CRITICAL
          </button>
        </div>
      </div>
    </div>
  );
};