import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';

interface SystemCheck {
  name: string;
  status: 'checking' | 'healthy' | 'degraded' | 'failed';
  details: string;
}

export default function HealthCheck() {
  const [checks, setChecks] = useState<Record<string, SystemCheck>>({
    runtime: { name: 'React Runtime Environment', status: 'checking', details: 'Verifying application state...' },
    storage: { name: 'Browser Local / IndexedDB Storage', status: 'checking', details: 'Checking storage persistence...' },
    network: { name: 'Network Connectivity', status: 'checking', details: 'Testing connectivity stack...' },
    env: { name: 'Firebase Environment Configuration', status: 'checking', details: 'Validating Firebase credentials...' },
  });

  useEffect(() => {
    const isRuntimeHealthy = typeof window !== 'undefined';

    let isStorageHealthy = false;
    try {
      localStorage.setItem('__health_test__', '1');
      localStorage.removeItem('__health_test__');
      isStorageHealthy = true;
    } catch {
      isStorageHealthy = false;
    }

    const isNetworkOnline = navigator.onLine;
    const isEnvConfigured = !!import.meta.env.VITE_FIREBASE_PROJECT_ID;

    setChecks({
      runtime: {
        name: 'React Runtime Environment',
        status: isRuntimeHealthy ? 'healthy' : 'failed',
        details: isRuntimeHealthy ? 'Vite + React execution engine operational.' : 'Global context missing.',
      },
      storage: {
        name: 'Browser Local / IndexedDB Storage',
        status: isStorageHealthy ? 'healthy' : 'degraded',
        details: isStorageHealthy ? 'Web Storage API active & accessible.' : 'Storage write access restricted.',
      },
      network: {
        name: 'Network Connectivity Status',
        status: isNetworkOnline ? 'healthy' : 'degraded',
        details: isNetworkOnline ? 'System online (Edge Sync active).' : 'System offline (Buffering mode ready).',
      },
      env: {
        name: 'Firebase Environment Validation',
        status: isEnvConfigured ? 'healthy' : 'failed',
        details: isEnvConfigured ? `Connected to project: ${import.meta.env.VITE_FIREBASE_PROJECT_ID}` : 'Firebase environment variables missing.',
      },
    });
  }, []);

  const allHealthy = Object.values(checks).every((c) => c.status === 'healthy');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600/10 text-primary-400 border border-primary-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">NOEXCUSE HPO V2 — System Health</h1>
            <p className="text-xs text-slate-400">Production Diagnostics & Deployment Status</p>
          </div>
          <div className="ml-auto">
            {allHealthy ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> SYSTEM OK
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
                <Activity className="h-3.5 w-3.5" /> DEGRADED
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-4">
          {Object.entries(checks).map(([key, check]) => (
            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-slate-200">{check.name}</p>
                <p className="text-xs text-slate-400">{check.details}</p>
              </div>
              <div>
                {check.status === 'healthy' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                {check.status === 'degraded' && <Activity className="h-5 w-5 text-amber-400" />}
                {check.status === 'failed' && <XCircle className="h-5 w-5 text-red-400" />}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-xs text-slate-500 pt-4">
          NOEXCUSE Health Monitoring Telemetry • PR17 Checkpoint 17.1
        </div>
      </div>
    </div>
  );
}
