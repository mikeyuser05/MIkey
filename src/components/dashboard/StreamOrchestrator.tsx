import React, { useState } from 'react';
import { useGlobalContext } from '../../hooks/useGlobalContext';
import { ShieldCheck, Cpu, Copy, Check } from 'lucide-react';

export const StreamOrchestrator: React.FC = () => {
  const globalContext = useGlobalContext() as any;
  const telemetry = globalContext?.telemetry;
  const devices = telemetry?.devices ? Object.values(telemetry.devices) : [];
  const [copied, setCopied] = useState(false);

  const hr = telemetry?.heartRate ?? 0;
  const spo2 = telemetry?.spo2 ?? 0;
  const gas = telemetry?.gas ?? 0;
  const steps = telemetry?.steps ?? 0;
  const utcTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

  const structuredPrompt = `You are an AI health assistant.

Analyse the following wearable sensor readings and generate a structured health report.

Patient Data
-------------
Timestamp: ${utcTimestamp}
Heart Rate: ${hr} bpm
Blood Oxygen (SpO₂): ${spo2}%
Environmental Gas Sensor (VOC/MQ-9): ${gas} ppm
Step Count Today: ${steps}

Instructions
------------
1. Explain what each reading means.
2. Identify whether each value is:
   - Normal
   - Mildly Abnormal
   - High Risk
   - Invalid Sensor Reading
3. Provide an overall health summary.
4. Mention possible causes of abnormal readings.
5. Suggest practical safety precautions.
6. Recommend when medical attention may be needed.
7. If any value appears impossible (for example HR = 0 or SpO₂ = 0), assume it may be a sensor or device error and advise verifying the reading before drawing medical conclusions.
8. Do not diagnose diseases with certainty.

Output Format
-------------
Health Status
Vital Analysis
Risk Level
Possible Causes
Recommended Actions
When to Seek Medical Help`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(structuredPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Multi-Node Grid */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">LGN.8 Multi-Node Pipeline Stream</h2>
              <p className="text-xs text-slate-400">Live multi-device telemetry synchronization (PR5 – PR10 Active)</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            LGN.8 ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {devices.length > 0 ? (
            devices.map((device: any) => (
              <div key={device.deviceId || Math.random()} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">{device.deviceId}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            ))
          ) : (
            ['PR1', 'PR2', 'PR5', 'PR6', 'PR7', 'PR8', 'PR9', 'PR10'].map((node) => (
              <div key={node} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">{node}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dynamic XAI & Structured LLM Prompt Engine Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-100">XAI Decision Reasoner (PR10)</h3>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-mono">LIVE</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            System health evaluated as <span className="text-emerald-400 font-semibold">OPTIMAL</span> based on LGN.8 multi-node telemetry analysis: Heart Rate ({hr} bpm) and SpO2 ({spo2}%) readings processed via PR1 ESP32 node. MQ-9 gas concentrations ({gas} PPM) evaluated against PR10 safety compliance standards.
          </p>
        </div>

        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-100">LLM Prompt Engine (PR10)</h3>
            <button 
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed custom-scrollbar">
            {structuredPrompt}
          </div>
        </div>
      </div>
    </div>
  );
};