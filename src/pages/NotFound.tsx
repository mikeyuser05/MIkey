import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-4 border border-amber-500/20">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
      <h2 className="text-lg font-semibold text-slate-300 mb-2">Route Not Found</h2>
      <p className="text-slate-400 max-w-sm mb-6 text-sm">
        The requested telemetry endpoint or path does not exist on this node.
      </p>
      <Link
        to="/"
        className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors border border-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Return to Dashboard
      </Link>
    </div>
  );
}
