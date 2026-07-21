import React, { Suspense, lazy } from 'react';
import { ToastProvider } from '../components/shared/ToastContainer';
import { ErrorBoundary } from '../components/shared/ErrorBoundary';
import { SkeletonCard } from '../components/ui/SkeletonCard';

// Main Telemetry Components (Fixed named imports)
import { StreamOrchestrator } from '../components/dashboard/StreamOrchestrator';
import { DeviceStatusPanel } from '../components/dashboard/DeviceStatusPanel';
import { RecentEventsPanel } from '../components/dashboard/RecentEventsPanel';

const MemoizedAnalyticsLayout = lazy(() =>
  import('../components/dashboard/MemoizedAnalyticsLayout').then(m => ({ default: m.MemoizedAnalyticsLayout }))
);

export const Dashboard: React.FC = () => {
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
        </main>
      </div>
    </ToastProvider>
  );
};

export default Dashboard;