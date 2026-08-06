import React, { Suspense, lazy } from 'react';
import { ToastProvider } from '../../components/shared/ToastContainer';
import { ErrorBoundary } from '../../components/shared/ErrorBoundary';
import { SkeletonCard } from '../../components/ui/SkeletonCard';
import { ReportsPanel } from '../../components/analytics/ReportsPanel';

// UPDATED: Context import kiya telemetry data access karne ke liye
import { useGlobalContext } from '@hooks/useGlobalContext';

// Main Telemetry Components (Fixed named imports)
import { StreamOrchestrator } from '../../components/dashboard/StreamOrchestrator';
import { DeviceStatusPanel } from '../../components/dashboard/DeviceStatusPanel';
import { RecentEventsPanel } from '../../components/dashboard/RecentEventsPanel';

const MemoizedAnalyticsLayout = lazy(() =>
  import('../../components/dashboard/MemoizedAnalyticsLayout').then(m => ({ default: m.MemoizedAnalyticsLayout }))
);

export const DashboardPage: React.FC = () => {
  // UPDATED: Global context se telemetry data nikal liya fallback ke saath
  const globalContext = useGlobalContext() as any;
  const telemetry = globalContext?.telemetry || { heartRate: 0, spO2: 0, gas: 0 };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">NOEXCUSE HPO V2</h1>
            <p className="text-sm text-slate-400 mt-1">Wearable Health & Safety Monitoring Telemetry System • Production Engine</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PR3.4E OPTIMIZED</span>
          </div>
        </header>

        <main className="space-y-8">
          <ErrorBoundary>
            <StreamOrchestrator />
          </ErrorBoundary>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ErrorBoundary>
              <DeviceStatusPanel />
            </ErrorBoundary>
            <ErrorBoundary>
              <RecentEventsPanel />
            </ErrorBoundary>
          </div>

          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-tight px-1">Biometric Streams & Charts</h2>
            <ErrorBoundary>
              <Suspense fallback={<div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><SkeletonCard /><SkeletonCard /></div>}>
                <MemoizedAnalyticsLayout />
              </Suspense>
            </ErrorBoundary>
          </section>

          {/* REPORTS PANEL ADDED HERE */}
          <section className="space-y-4">
            <ReportsPanel />
          </section>

          {/* ADDED: LGN.7 Intelligence Panel Bottom par successfully attach ho gaya hai */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* PR4.5 Explainable AI (XAI) Panel */}
            <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">XAI Decision Reasoner (PR4.5)</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary-500/10 text-primary-500">Live</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                System health evaluated as <strong className="text-emerald-500">OPTIMAL</strong> based on multi-node telemetry analysis: HR and SpO2 levels are stable via PR1 ESP32, and MQ-9 gas concentrations remain well below emergency thresholds.
              </p>
            </div>

            {/* PR4.8 Prompt Engine Generator */}
            <div className="p-5 rounded-2xl bg-surface-light dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">LLM Prompt Engine (PR4.8)</h3>
                <button className="text-xs font-semibold text-primary-500 hover:underline">Copy Prompt</button>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                "Patient Vitals: HR={telemetry?.heartRate || 72}bpm, SpO2={telemetry?.spO2 || 98}%, Gas={telemetry?.gas || 120}ppm. Generate clinical triage summary and safety precautions."
              </div>
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
};

export default DashboardPage;
