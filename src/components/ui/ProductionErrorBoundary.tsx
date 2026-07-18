import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ProductionErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[CRITICAL SYSTEM ERROR] Telemetry Engine Fault:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center font-mono">
          <div className="max-w-md rounded-2xl border border-red-900/60 bg-neutral-950 p-6 shadow-2xl">
            <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">System Intercepted Fault</h2>
            <p className="text-[11px] text-neutral-400 mb-4">The live monitoring interface encountered a structural layout or data stream boundary exception.</p>
            <button 
              onClick={() => this.setState({ hasError: false, error: null })} 
              className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-white transition-all cursor-pointer"
            >
              Reset Telemetry Canvas
            </button>
          </div>
        </div>
      );
    }
    return this.children;
  }
}