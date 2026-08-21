import os

# 1. Update Settings Page Component
settings_code = '''import React, { useState, useEffect } from 'react';
import { auditLogger, AuditLogEntry } from '../services/auditLogger';
import { patientProfileStore } from '../services/patientProfileStore';

export function Settings() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [activeTheme, setActiveTheme] = useState('Cyber Dark');
  const profile = patientProfileStore.getProfile();

  useEffect(() => {
    const currentLogs = auditLogger.getLogs();
    if (currentLogs.length === 0) {
      auditLogger.log('SYSTEM_INIT', 'INFO', 'Settings Governance Dashboard Loaded', 'System Engine');
    }
    setLogs(auditLogger.getLogs());
  }, []);

  const handlePaletteChange = (palette: string) => {
    setActiveTheme(palette);
    auditLogger.log('THEME_CHANGED', 'INFO', `Switched theme palette to ${palette}`, 'User');
    setLogs(auditLogger.getLogs());
  };

  const handleClearLogs = () => {
    auditLogger.clearLogs();
    setLogs([]);
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings & Operations Governance</h1>
        <p className="text-sm text-slate-400 mt-1">PR35 Theme Switcher, PR36 Baseline Engine, and PR38 Audit Logging.</p>
      </div>

      {/* PR35 Palette Selector */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-4">PR35 — Theme Palette & Emergency Switch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Cyber Dark', 'Tactical Red', 'Clinical Emerald'].map((theme) => (
            <button
              key={theme}
              onClick={() => handlePaletteChange(theme)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeTheme === theme
                  ? 'border-sky-500 bg-sky-950/50 text-white shadow-lg'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-sm">{theme}</div>
              <div className="text-xs text-slate-500 mt-1">
                {theme === 'Cyber Dark' && 'Default production dark UI theme'}
                {theme === 'Tactical Red' && 'High contrast emergency accent mode'}
                {theme === 'Clinical Emerald' && 'Calm medical monitoring palette'}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* PR36 Baseline Profile */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-4">PR36 — Patient Baseline Profile</h2>
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div>
              <div className="text-base font-bold text-white">{profile?.name || 'Guest User (Patient #01)'}</div>
              <div className="text-xs text-slate-400">Patient ID: {profile?.id || 'PT-01'} • Age: {profile?.age || 28}</div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium rounded-full">
              Baseline Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Resting Heart Rate</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1">{profile?.baselineVitals?.restingHeartRate || 72} <span className="text-xs text-slate-500 font-normal">BPM</span></div>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Baseline SpO2</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1">{profile?.baselineVitals?.baselineSpO2 || 98}%</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Baseline Temperature</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1">{profile?.baselineVitals?.baselineTemp || 36.8}°C</div>
            </div>
          </div>
        </div>
      </section>

      {/* PR38 Audit Logger */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider">PR38 — System Audit Logs & Hardening</h2>
          {logs.length > 0 && (
            <button
              onClick={handleClearLogs}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2.5 py-1 rounded border border-rose-500/20 bg-rose-500/10"
            >
              Clear Logs
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="p-4 bg-slate-950 rounded-xl text-center text-slate-500 border border-slate-800">
              No audit logs captured.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.severity}
                  </span>
                  <div>
                    <span className="text-slate-200 font-semibold">{log.action}: </span>
                    <span className="text-slate-400">{log.details}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 whitespace-nowrap">
                  {log.actor} • {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Settings;
'''

files_to_write = {
    "src/pages/Settings.tsx": settings_code,
    "src/pages/Settings/index.tsx": settings_code
}

for path, code in files_to_write.items():
    if os.path.exists(os.path.dirname(path)):
        with open(path, "w", encoding="utf-8") as f:
            f.write(code.strip() + "\n")
        print(f"✅ Forced Update: {path}")