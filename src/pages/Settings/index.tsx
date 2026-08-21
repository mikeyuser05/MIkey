import React, { useState } from 'react';

export function Settings() {
  const [activeTheme, setActiveTheme] = useState('Cyber Dark');

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings & Operations Governance</h1>
        <p className="text-sm text-slate-400 mt-1">PR35 Theme Switcher, PR36 Baseline Engine, and PR38 Audit Logging.</p>
      </div>

      {/* PR35 Theme Palette Switcher */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-4">PR35 — Theme Palette & Emergency Switch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Cyber Dark', 'Tactical Red', 'Clinical Emerald'].map((theme) => (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeTheme === theme
                  ? 'border-sky-500 bg-sky-950/60 text-white shadow-lg'
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

      {/* PR36 Patient Baseline */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-4">PR36 — Patient Baseline Profile</h2>
        <div className="bg-slate-950 rounded-xl p-5 border border-slate-800/80 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
            <div>
              <div className="text-base font-bold text-white">Guest User (Patient #01)</div>
              <div className="text-xs text-slate-400">Patient ID: PT-01 • Age: 28</div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium rounded-full">
              Baseline Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Resting Heart Rate</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1">72 <span className="text-xs text-slate-500 font-normal">BPM</span></div>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Baseline SpO2</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1">98%</div>
            </div>
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <div className="text-xs text-slate-400">Baseline Temperature</div>
              <div className="text-lg font-mono font-bold text-slate-200 mt-1">36.8°C</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Settings;
