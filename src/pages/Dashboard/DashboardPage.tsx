import React, { Suspense, lazy } from 'react';
import { ToastProvider } from '../../components/shared/ToastContainer';
import { ErrorBoundary } from '../../components/shared/ErrorBoundary';
import { SkeletonCard } from '../../components/ui/SkeletonCard';

import { StreamOrchestrator } from '../../components/dashboard/StreamOrchestrator';
import { DeviceStatusPanel } from '../../components/dashboard/DeviceStatusPanel';
import { RecentEventsPanel } from '../../components/dashboard/RecentEventsPanel';

const MemoizedAnalyticsLayout = lazy(() =>
  import('../../components/dashboard/MemoizedAnalyticsLayout').then(m => ({ default: m.MemoizedAnalyticsLayout }))
);

export const DashboardPage: React.FC = () => {
  return (
    <ToastProvider>
      <div className="space-y-6 text-slate-100">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">NOEXCUSE HPO V2</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Wearable Health & Safety Monitoring Telemetry System • Production Engine
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-400 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PR3.4E OPTIMIZED</span>
          </div>
        </header>

        <main className="space-y-6">
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

          <section className="space-y-3">
            <h2 className="text-base font-bold text-white tracking-tight px-1">
              Biometric Streams & Charts
            </h2>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                }
              >
                <MemoizedAnalyticsLayout />
              </Suspense>
            </ErrorBoundary>
          </section>
        </main>
      </div>
    </ToastProvider>
  );
};

export default DashboardPage;