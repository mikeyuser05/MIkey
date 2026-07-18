import React from 'react';
import { ChartHeader } from './ChartHeader';

export const ChartCard: React.FC<{ title: string; subtitle?: string; unit?: string; isLoading?: boolean; isEmpty?: boolean; children: React.ReactNode }> = ({
  title, subtitle, unit, isLoading = false, isEmpty = false, children,
}) => (
  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-slate-700/50 shadow-xl focus-within:ring-2 focus-within:ring-slate-700 focus-within:outline-none" tabIndex={0}>
    <div>
      <ChartHeader title={title} subtitle={subtitle} unit={unit} />
      <div className="relative w-full mt-2">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/40 rounded-xl backdrop-blur-xs animate-pulse">
            <div className="w-8 h-8 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin mb-2" />
          </div>
        )}
        {!isLoading && isEmpty && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800/60 p-6 text-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Framework Data</span>
          </div>
        )}
        <div className={`w-full ${isLoading || isEmpty ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>{children}</div>
      </div>
    </div>
  </div>
);