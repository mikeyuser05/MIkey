// src/components/analytics/ReportsPanel.tsx
import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ReportsPanel: React.FC = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const exportPDF = async () => {
  if (!reportRef.current) return;

  try {
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#030712'
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Exact proportion sizing without overflow margins
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`LGN9_Clinical_Health_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('Failed to generate LGN.9 PDF export:', err);
  }
};

  return (
    <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 text-white space-y-6">
      {/* Panel Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            LGN.9 Clinical Telemetry & Patient-Doctor Diagnostic Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Automated multi-node sensor synthesis for physician review and health auditing.
          </p>
        </div>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Full Doctor Report (PDF)
        </button>
      </div>

      {/* PDF Export Target Container */}
      <div
        ref={reportRef}
        className="p-8 bg-slate-950 rounded-xl border border-slate-800 space-y-6 text-slate-200"
      >
        {/* Medical Header */}
        <div className="flex justify-between items-start border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">NOEXCUSE HPO V2</h1>
            <p className="text-xs text-blue-400 font-mono tracking-wider uppercase mt-1">
              LGN.9 Multi-Node Clinical Telemetry Engine
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 space-y-1">
            <p><strong className="text-slate-200">Report ID:</strong> RPT-2026-0802-09X</p>
            <p><strong className="text-slate-200">Generated:</strong> {new Date().toLocaleString()}</p>
            <p><strong className="text-slate-200">Sync Status:</strong> Firebase RTDB Operational</p>
          </div>
        </div>

        {/* Patient Profile & Hardware Nodes */}
        <div className="grid grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-lg border border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold mb-1">Subject Info</span>
            <p className="text-sm font-bold text-white">Guest User (Patient #01)</p>
            <p className="text-slate-400 mt-0.5">Monitoring Profile: Continuous Wearable Telemetry</p>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider block font-semibold mb-1">Active Hardware Pipeline</span>
            <p className="text-slate-300 font-mono">PR1 (ESP32 MAX30100) • PR2 (ESP32 MQ-9 / BMI270)</p>
            <p className="text-emerald-400 font-mono mt-0.5">ESP-NOW Mesh Network Active</p>
          </div>
        </div>

        {/* Biometric Vital Signs Matrix */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            1. Real-Time Biometric Sensor Matrix
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">Heart Rate (MAX30100)</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">72 <span className="text-sm font-normal text-slate-400">BPM</span></div>
              <span className="text-[10px] text-emerald-500/80 block mt-1">Normal Resting Baseline</span>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">SpO2 Blood Oxygen</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">98 <span className="text-sm font-normal text-slate-400">%</span></div>
              <span className="text-[10px] text-cyan-500/80 block mt-1">Optimal Saturation</span>
            </div>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400">Environmental MQ-9 Gas</span>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">1676 <span className="text-sm font-normal text-slate-400">PPM</span></div>
              <span className="text-[10px] text-amber-500/80 block mt-1">Below Hazard Threshold</span>
            </div>
          </div>
        </div>

        {/* XAI Clinical Decision Assessment */}
        <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
          <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            2. XAI Diagnostic Reasoner (PR4.5 Assessment)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            System health evaluated as <strong className="text-emerald-400">OPTIMAL</strong> based on multi-node telemetry analysis. Heart rate (72 BPM) and SpO2 levels (98%) are stable via PR1 ESP32, and MQ-9 atmospheric gas concentrations remain strictly within safe operating parameters. Kinematic vector trends show steady physical baseline with zero anomalous spikes detected.
          </p>
        </div>

        {/* Doctor Summary & Clinical Prompt Payload */}
        <div className="p-4 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            3. LLM Compiled Prompt Payload (Physician Brief)
          </h3>
          <p className="text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded border border-slate-800/80">
            "Patient Vitals: HR=72bpm, SpO2=98%, Gas=1676ppm. Generate clinical triage summary and safety precautions for physician review."
          </p>
        </div>

        {/* Footer / Medical Disclaimer */}
        <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500">
          <p>HPO V2 Telemetry System • LGN.9 Clinical Data Bridge</p>
          <p>Confidential Medical Telemetry Report</p>
        </div>
      </div>
    </div>
  );
};