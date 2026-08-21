import React, { useState } from 'react';
import { patientProfileStore } from '../../services/patientProfileStore';
import { PatientProfile } from '../../types/pr36Patient';
import { User, Activity, Heart, ShieldAlert } from 'lucide-react';

export const PatientProfileCard: React.FC = () => {
  const [profile, setProfile] = useState<PatientProfile>(patientProfileStore.getProfile());

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{profile.fullName}</h3>
            <p className="text-xs text-slate-400">ID: {profile.id} • {profile.age} Y/O ({profile.gender})</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-mono">
          Blood Group: {profile.bloodGroup}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline Vitals Card */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-blue-400">
            <Activity className="h-4 w-4" />
            <span>BASELINE VITALS</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Resting HR:</span>
              <span className="font-mono text-white">{profile.baselineVitals.restingHeartRate} bpm</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Baseline SpO2:</span>
              <span className="font-mono text-white">{profile.baselineVitals.baselineSpO2}%</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Body Temp:</span>
              <span className="font-mono text-white">{profile.baselineVitals.baselineTemp}°C</span>
            </div>
          </div>
        </div>

        {/* Medical Context */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-amber-400">
            <ShieldAlert className="h-4 w-4" />
            <span>MEDICAL HISTORY</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400">Conditions:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.conditions.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-800 text-slate-200 rounded text-[11px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};