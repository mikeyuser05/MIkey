import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean; error: Error | null }> {
  public state = { hasError: false, error: null as Error | null };
  public static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  public componentDidCatch(e: Error, info: ErrorInfo) { console.error('Engine Pipeline Crash:', e, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-rose-950/20 border border-rose-900/60 rounded-2xl p-6 text-center max-w-xl mx-auto my-12 backdrop-blur-md space-y-4" role="alert">
          <div className="mx-auto w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400"><AlertTriangle className="w-6 h-6" /></div>
          <h2 className="text-lg font-extrabold text-white">Pipeline Exception Intercepted</h2>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider"><RefreshCw className="w-3.5 h-3.5" /> Purge State</button>
        </div>
      );
    }
    return this.props.children;
  }
}